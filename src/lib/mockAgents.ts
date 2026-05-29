import type { AgentId } from "./agents";
import type { UploadedFile } from "./store";

export interface StreamChunk {
  text: string;
}

export interface AgentResponse {
  meta?: Record<string, unknown>;
}

const TEXT_FIELDS = [
  "response",
  "answer",
  "result",
  "text",
  "content",
  "message",
  "rca_report",
  "report",
  "analysis",
  "summary",
];

function readTextField(data: unknown): string | undefined {
  if (typeof data === "string") return data;
  if (!data || typeof data !== "object") return undefined;

  const record = data as Record<string, unknown>;
  for (const field of TEXT_FIELDS) {
    const value = record[field];
    if (typeof value === "string" && value.trim()) return value;
  }

  return undefined;
}

function normalizeRcaReport(text: string): string {
  let normalized = text
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "  ")
    .replace(/\\"/g, '"')
    .replace(/^```[a-zA-Z]*\s*/gm, "")
    .replace(/```$/gm, "")
    .replace(/^\s*_{8,}\s*$/gm, "---")
    .trim();

  if (normalized.startsWith("{") && normalized.endsWith("}")) {
    try {
      const parsed = JSON.parse(normalized);
      const parsedText = readTextField(parsed);
      if (parsedText) return normalizeRcaReport(parsedText);
    } catch {
      // Keep the original text if it only looks like JSON.
    }
  }

  normalized = normalized
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (/^[A-Z][A-Z\s/()-]{4,}$/.test(trimmed)) {
        return `## ${trimmed}`;
      }
      return line;
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");

  return normalized;
}

function extractResponseText(agentId: AgentId, data: unknown): string {
  const text = readTextField(data) ?? JSON.stringify(data, null, 2);
  return agentId === "rca" ? normalizeRcaReport(text) : text;
}

const AGENT_URLS: Record<AgentId, string> = {
  knowledge: import.meta.env.VITE_RENDER_KNOWLEDGE_AGENT_URL || "https://py-agent-knowledgeassistant-8bby.onrender.com",
  rca: import.meta.env.VITE_RENDER_RCA_AGENT_URL || "https://patchly-rca-agent-2.onrender.com",
  codegen: import.meta.env.VITE_RENDER_CODEGEN_AGENT_URL || "https://code-generator-wfye.onrender.com",
  autofix: import.meta.env.VITE_RENDER_AUTOFIX_AGENT_URL || "https://your-autofix-agent.onrender.com/chat",
};

// Primary endpoints for each agent
const PRIMARY_ENDPOINTS: Record<AgentId, string> = {
  knowledge: "/chat",
  rca: "/analyze",
  codegen: "/generate",
  autofix: "/fix",
};

// Fallback endpoints to try if primary fails
const FALLBACK_ENDPOINTS: Record<AgentId, string[]> = {
  knowledge: ["/query", "/ask", "/upload", ""],
  rca: ["/chat", "/api/analyze", ""],
  codegen: ["/generate", "/edit", ""],
  autofix: ["/chat", ""],
};

export async function* streamAgent(
  agentId: AgentId,
  prompt: string,
  files?: UploadedFile[]
): AsyncGenerator<StreamChunk, AgentResponse> {
  const baseUrl = AGENT_URLS[agentId];
  let meta: Record<string, unknown> = {};
  let lastError: Error | null = null;

  // For knowledge assistant with files, use /upload endpoint
  if (agentId === "knowledge" && files && files.length > 0) {
    const uploadUrl = baseUrl + "/upload";
    console.log(`Uploading files to knowledge assistant at: ${uploadUrl}`);
    
    try {
      // Note: This is a placeholder. You'll need to implement actual file upload
      // For now, we'll just send the file metadata
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: prompt,
          files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Upload response:', data);
        yield { text: "Files uploaded successfully. " };
      }
    } catch (error) {
      console.error('File upload error:', error);
      yield { text: "Note: File upload encountered an issue. Proceeding with query... " };
    }
  }

  // Try primary endpoint first, then fallbacks
  const endpointsToTry = [PRIMARY_ENDPOINTS[agentId], ...FALLBACK_ENDPOINTS[agentId]];
  
  for (const endpoint of endpointsToTry) {
    const url = baseUrl + endpoint;
    
    // Try POST first, then GET
    for (const method of ["POST", "GET"]) {
      console.log(`Trying ${method} ${agentId} agent at:`, url);

      try {
        const fetchOptions: RequestInit = {
          method,
          headers: {
            "Content-Type": "application/json",
          },
        };

        // Only add body for POST requests
        if (method === "POST") {
          fetchOptions.body = JSON.stringify({ 
            message: prompt,
            query: prompt,
            question: prompt,
            prompt: prompt,
            input: prompt,
            files: files?.map((f) => ({ name: f.name, size: f.size, type: f.type })) ?? []
          });
        }

        const response = await fetch(url, fetchOptions);

        console.log(`${method} ${url} - Status:`, response.status);

        if (!response.ok) {
          if (response.status === 405) {
            console.log(`${method} not allowed, trying next method...`);
            continue; // Try next method
          }
          const errorText = await response.text();
          console.error('Error response:', errorText);
          lastError = new Error(`${response.status}: ${errorText}`);
          continue;
        }

        const contentType = response.headers.get("content-type");
        console.log('Content-Type:', contentType);

        // Handle streaming response
        if (contentType?.includes("text/event-stream") || contentType?.includes("stream")) {
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) {
            throw new Error("No response body");
          }

          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();
                if (data === "[DONE]") continue;
                
                try {
                  const parsed = JSON.parse(data);
                  const parsedText = readTextField(parsed);
                  if (parsedText) {
                    yield {
                      text: agentId === "rca" ? normalizeRcaReport(parsedText) : parsedText,
                    };
                  }
                  if (parsed.meta || parsed.metadata) {
                    meta = parsed.meta || parsed.metadata;
                  }
                } catch (e) {
                  yield { text: data };
                }
              }
            }
          }

          if (buffer.trim()) {
            yield { text: buffer };
          }
        } else {
          // Handle regular JSON response
          const data = await response.json();
          console.log('Full Response data:', JSON.stringify(data, null, 2));

          // Extract text from various possible fields
          const text = extractResponseText(agentId, data);
          
          // Extract metadata (confidence, sources, citations)
          // Check all possible locations for metadata
          console.log('Checking for confidence:', data.confidence, data.score, data.confidence_score);
          console.log('Checking for sources:', data.sources, data.citations, data.documents, data.source_documents);
          
          if (data.confidence !== undefined) {
            meta.confidence = data.confidence;
          } else if (data.score !== undefined) {
            meta.confidence = data.score;
          } else if (data.confidence_score !== undefined) {
            meta.confidence = data.confidence_score;
          }
          
          // Check for sources/citations in various formats
          if (data.sources && Array.isArray(data.sources)) {
            meta.citations = data.sources.map((s: any) => ({
              title: s.title || s.document || s.source || s.file_name || 'Unknown Document',
              page: s.page || s.page_number || s.page_num || 0,
              score: s.score || s.relevance || s.similarity || 0
            }));
          } else if (data.citations && Array.isArray(data.citations)) {
            meta.citations = data.citations.map((c: any) => ({
              title: c.title || c.document || c.source || c.file_name || 'Unknown Document',
              page: c.page || c.page_number || c.page_num || 0,
              score: c.score || c.relevance || c.similarity || 0
            }));
          } else if (data.documents && Array.isArray(data.documents)) {
            meta.citations = data.documents.map((d: any) => ({
              title: d.title || d.document || d.source || d.file_name || 'Unknown Document',
              page: d.page || d.page_number || d.page_num || 0,
              score: d.score || d.relevance || d.similarity || 0
            }));
          } else if (data.source_documents && Array.isArray(data.source_documents)) {
            meta.citations = data.source_documents.map((sd: any) => ({
              title: sd.title || sd.document || sd.source || sd.file_name || sd.metadata?.source || 'Unknown Document',
              page: sd.page || sd.page_number || sd.page_num || sd.metadata?.page || 0,
              score: sd.score || sd.relevance || sd.similarity || 0
            }));
          }
          
          // Check nested metadata
          if (data.metadata) {
            if (data.metadata.confidence !== undefined) meta.confidence = data.metadata.confidence;
            if (data.metadata.sources) meta.citations = data.metadata.sources;
            if (data.metadata.citations) meta.citations = data.metadata.citations;
          }
          if (data.meta) {
            if (data.meta.confidence !== undefined) meta.confidence = data.meta.confidence;
            if (data.meta.sources) meta.citations = data.meta.sources;
            if (data.meta.citations) meta.citations = data.meta.citations;
          }

          console.log('Extracted metadata:', JSON.stringify(meta, null, 2));
          
          // Stream the text word by word for better UX
          const words = text.match(/\S+\s*/g) ?? [text];
          for (const word of words) {
            yield { text: word };
            await new Promise(resolve => setTimeout(resolve, 20));
          }
        }

        console.log(`✓ Successfully connected to ${agentId} using ${method} ${url}`);
        return { meta };
      } catch (error) {
        console.error(`Error with ${method} ${url}:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        continue; // Try next method/endpoint
      }
    }
  }

  // If all endpoints failed, throw the last error
  console.error(`All endpoints failed for ${agentId} agent`);
  throw lastError || new Error(`Failed to connect to ${agentId} agent`);
}
