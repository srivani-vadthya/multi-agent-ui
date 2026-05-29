import type { AgentDef } from "@/lib/agents";
import { FileSearch, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

interface Citation { title: string; page: number; score: number }

export function KnowledgePanel({
  meta,
  agent,
}: {
  meta: Record<string, unknown>;
  agent: AgentDef;
}) {
  const citations = (meta.citations as Citation[] | undefined) ?? [];
  const confidence = (meta.confidence as number | undefined) ?? 0;
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Only show confidence if it's meaningful (> 0.5 or 50%)
  const showConfidence = confidence > 0.5;
  
  // Only show sources if they have meaningful relevance scores (> 0)
  const meaningfulCitations = citations.filter(c => c.score > 0);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadUrl = import.meta.env.VITE_RENDER_KNOWLEDGE_UPLOAD_URL || "https://py-agent-knowledgeassistant-8bby.onrender.com/upload";

    console.log('Uploading to:', uploadUrl);
    console.log('Files:', Array.from(files).map(f => ({ name: f.name, size: f.size, type: f.type })));

    try {
      const formData = new FormData();
      
      // Try different field names that the API might expect
      Array.from(files).forEach((file) => {
        formData.append('file', file);  // singular 'file'
        formData.append('files', file); // plural 'files'
        formData.append('document', file); // 'document'
      });

      console.log('FormData entries:', Array.from(formData.entries()).map(([key, value]) => ({
        key,
        value: value instanceof File ? `File: ${value.name}` : value
      })));

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Response body:', responseText);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} - ${responseText}`);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        result = { message: responseText };
      }

      console.log('Upload result:', result);
      toast.success(`Successfully uploaded ${files.length} document(s)`);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to upload: ${errorMessage}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-emerald-600';
    if (score >= 0.6) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getConfidenceIcon = (score: number) => {
    if (score >= 0.7) return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    return <AlertCircle className="h-4 w-4 text-amber-600" />;
  };

  return (
    <div className="space-y-5">
      {/* Upload Section */}
      <div>
        <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Document Upload
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary px-4 py-3 text-sm font-medium transition-all hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload Documents'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.md"
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Upload PDFs, docs, or text files to the knowledge base
        </p>
      </div>

      {/* Confidence Score */}
      {showConfidence && (
        <div>
          <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Answer Confidence
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getConfidenceIcon(confidence)}
                <div>
                  <div className={`text-2xl font-bold tabular-nums ${getConfidenceColor(confidence)}`}>
                    {(confidence * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Confidence Score</div>
                </div>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${confidence * 100}%`,
                  background: agent.accentHex,
                  boxShadow: `0 0 8px ${agent.accentHex}`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Source Documents */}
      <div>
        <div className="mb-3 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          <FileSearch className="h-3 w-3" /> Source Documents
        </div>
        {meaningfulCitations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-secondary/50 p-4 text-center">
            <FileSearch className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-xs text-muted-foreground">
              {citations.length > 0 
                ? "No relevant sources found for this query"
                : "Source documents will appear here after a document-based query"}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {meaningfulCitations.map((c, i) => (
              <li
                key={i}
                className="rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-foreground">{c.title}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Page {c.page}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        Relevance: 
                        <span className="font-semibold" style={{ color: agent.accentHex }}>
                          {(c.score * 100).toFixed(0)}%
                        </span>
                      </span>
                    </div>
                  </div>
                  <div
                    className="rounded-lg px-2 py-1 text-xs font-bold tabular-nums shadow-sm"
                    style={{ 
                      background: `${agent.accentHex}15`, 
                      color: agent.accentHex,
                      border: `1px solid ${agent.accentHex}30`
                    }}
                  >
                    {(c.score * 100).toFixed(0)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}