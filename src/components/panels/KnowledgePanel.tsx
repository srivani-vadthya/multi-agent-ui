import type { AgentDef } from "@/lib/agents";
import { FileSearch } from "lucide-react";

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

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Confidence
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-semibold tabular-nums">
            {(confidence * 100).toFixed(0)}%
          </div>
          <div className="text-[11px] text-muted-foreground">retrieval score</div>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${confidence * 100}%`,
              background: agent.accentHex,
              boxShadow: `0 0 12px ${agent.accentHex}`,
            }}
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          <FileSearch className="h-3 w-3" /> Citations
        </div>
        {citations.length === 0 ? (
          <div className="text-xs text-muted-foreground">
            Source passages will appear here after a query.
          </div>
        ) : (
          <ul className="space-y-2">
            {citations.map((c, i) => (
              <li
                key={i}
                className="rounded-lg border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 text-sm font-medium">{c.title}</div>
                  <div
                    className="rounded-md px-1.5 py-0.5 text-[10px] tabular-nums"
                    style={{ background: `${agent.accentHex}22`, color: agent.accentHex }}
                  >
                    {(c.score * 100).toFixed(0)}
                  </div>
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">p. {c.page}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}