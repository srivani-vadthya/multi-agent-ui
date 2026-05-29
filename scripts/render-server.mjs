import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import server from "../dist/server/server.js";

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
const clientDir = resolve("dist/client");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function staticFilePath(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split("?")[0]);
  const normalizedPath = normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const candidate = join(clientDir, normalizedPath);
  return candidate.startsWith(clientDir) ? candidate : null;
}

function serveStatic(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") return false;

  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
  const filePath = staticFilePath(pathname);
  if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) return false;

  response.writeHead(200, {
    "content-type": contentTypes[extname(filePath)] || "application/octet-stream",
    "cache-control": pathname.startsWith("/assets/")
      ? "public, max-age=31536000, immutable"
      : "public, max-age=0, must-revalidate",
  });

  if (request.method === "HEAD") {
    response.end();
    return true;
  }

  createReadStream(filePath).pipe(response);
  return true;
}

function toWebRequest(request) {
  const protocol = request.headers["x-forwarded-proto"] || "http";
  const hostHeader = request.headers["x-forwarded-host"] || request.headers.host;
  const url = `${protocol}://${hostHeader}${request.url}`;
  const headers = new Headers();

  for (const [key, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }

  return new Request(url, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request,
    duplex: "half",
  });
}

async function sendWebResponse(webResponse, nodeResponse) {
  nodeResponse.statusCode = webResponse.status;
  nodeResponse.statusMessage = webResponse.statusText;

  webResponse.headers.forEach((value, key) => {
    nodeResponse.setHeader(key, value);
  });

  if (!webResponse.body) {
    nodeResponse.end();
    return;
  }

  const reader = webResponse.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    nodeResponse.write(Buffer.from(value));
  }
  nodeResponse.end();
}

createServer(async (request, response) => {
  try {
    if (serveStatic(request, response)) return;

    const webRequest = toWebRequest(request);
    const webResponse = await server.fetch(webRequest, process.env, {});
    await sendWebResponse(webResponse, response);
  } catch (error) {
    console.error(error);
    response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    response.end("Internal Server Error");
  }
}).listen(port, host, () => {
  console.log(`Nexus AI listening on http://${host}:${port}`);
});
