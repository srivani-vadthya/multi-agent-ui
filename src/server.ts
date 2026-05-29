import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type AgentId = "knowledge" | "rca" | "codegen" | "autofix";
type AgentProxyAction = "chat" | "upload";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

const AGENT_URL_ENV: Record<AgentId, string> = {
  knowledge: "RENDER_KNOWLEDGE_AGENT_URL",
  rca: "RENDER_RCA_AGENT_URL",
  codegen: "RENDER_CODEGEN_AGENT_URL",
  autofix: "RENDER_AUTOFIX_AGENT_URL",
};

const DEFAULT_AGENT_PATH: Record<AgentId, string> = {
  knowledge: "/ask",
  rca: "/analyze",
  codegen: "/ask",
  autofix: "/ask",
};

const DEFAULT_AGENT_UPLOAD_PATH: Record<AgentId, string> = {
  knowledge: "",
  rca: "",
  codegen: "",
  autofix: "",
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function getEnvValue(env: unknown, key: string): string | undefined {
  if (env && typeof env === "object" && key in env) {
    const value = (env as Record<string, unknown>)[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  const value = typeof process !== "undefined" ? process.env[key] : undefined;
  return value?.trim() || undefined;
}

function isAgentId(value: string): value is AgentId {
  return value === "knowledge" || value === "rca" || value === "codegen" || value === "autofix";
}

function isAgentProxyRequest(
  pathname: string
): { agentId: AgentId; action: AgentProxyAction } | undefined {
  const match = pathname.match(/^\/api\/agents\/([^/]+)\/(chat|upload)$/);
  if (!match) return undefined;
  const agentId = match[1];
  if (!isAgentId(agentId)) return undefined;
  return { agentId, action: match[2] as AgentProxyAction };
}

function proxyHeaders(request: Request, env: unknown, agentId: AgentId): Headers {
  const headers = new Headers({
    accept: request.headers.get("accept") ?? "application/json, text/event-stream",
  });
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const apiKey =
    getEnvValue(env, `RENDER_${agentId.toUpperCase()}_AGENT_API_KEY`) ??
    getEnvValue(env, "RENDER_AGENT_API_KEY");

  if (apiKey) {
    headers.set("authorization", `Bearer ${apiKey}`);
  }

  return headers;
}

function resolveRenderUrl(rawUrl: string, agentId: AgentId, action: AgentProxyAction): string {
  const url = new URL(rawUrl);
  if (url.pathname === "" || url.pathname === "/") {
    url.pathname =
      action === "upload" ? DEFAULT_AGENT_UPLOAD_PATH[agentId] : DEFAULT_AGENT_PATH[agentId];
  }
  return url.toString();
}

function getConfiguredAgentUrl(
  env: unknown,
  agentId: AgentId,
  action: AgentProxyAction
): { envKey: string; url: string | undefined } {
  const baseEnvKey = AGENT_URL_ENV[agentId];
  if (action === "chat") {
    return { envKey: baseEnvKey, url: getEnvValue(env, baseEnvKey) };
  }

  const uploadEnvKey = `RENDER_${agentId.toUpperCase()}_UPLOAD_URL`;
  return {
    envKey: uploadEnvKey,
    url: getEnvValue(env, uploadEnvKey),
  };
}

async function proxyAgentRequest(
  request: Request,
  env: unknown,
  agentId: AgentId,
  action: AgentProxyAction
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { allow: "POST" },
    });
  }

  const { envKey, url: configuredUrl } = getConfiguredAgentUrl(env, agentId, action);
  if (!configuredUrl) {
    console.warn(`[agent-proxy] Missing Render URL for "${agentId}"`, {
      envKey,
      action,
    });
    if (action === "upload") {
      return new Response("Upload endpoint is not configured; skipped.", { status: 204 });
    }
    return new Response(`${envKey} is not configured`, { status: 501 });
  }

  const renderUrl = resolveRenderUrl(configuredUrl, agentId, action);
  const requestContentType = request.headers.get("content-type") ?? "";
  const isMultipart = requestContentType.includes("multipart/form-data");
  const body = await request.arrayBuffer();
  const bodyPreview = isMultipart
    ? `[multipart upload: ${body.byteLength} bytes]`
    : new TextDecoder().decode(body).slice(0, 300);

  console.info(`[agent-proxy] Forwarding "${agentId}" ${action} request to Render`, {
    envKey,
    url: renderUrl,
    bodyPreview,
  });

  let upstream: Response;
  try {
    upstream = await fetch(renderUrl, {
      method: "POST",
      headers: proxyHeaders(request, env, agentId),
      body,
    });
  } catch (error) {
    console.error(`[agent-proxy] Fetch to Render failed for "${agentId}" ${action}`, {
      url: renderUrl,
      error,
    });
    return new Response(`Render fetch failed for ${agentId} ${action}: ${String(error)}`, {
      status: 502,
    });
  }

  const headers = new Headers();
  const upstreamContentType = upstream.headers.get("content-type");
  if (upstreamContentType) headers.set("content-type", upstreamContentType);

  console.info(`[agent-proxy] Render response for "${agentId}" ${action}`, {
    status: upstream.status,
    statusText: upstream.statusText,
    contentType: upstreamContentType,
  });

  if (!upstream.ok) {
    const errorBody = await upstream.text().catch(() => "");
    console.error(`[agent-proxy] Render returned an error for "${agentId}" ${action}`, {
      status: upstream.status,
      statusText: upstream.statusText,
      bodyPreview: errorBody.slice(0, 1000),
    });
    return new Response(errorBody || upstream.statusText, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      const agentProxy = isAgentProxyRequest(url.pathname);
      if (agentProxy) {
        return await proxyAgentRequest(request, env, agentProxy.agentId, agentProxy.action);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
