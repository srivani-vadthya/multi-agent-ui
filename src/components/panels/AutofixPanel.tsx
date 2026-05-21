import type { AgentDef } from "@/lib/agents";
import { ShieldCheck, Plus, Minus } from "lucide-react";

export function AutofixPanel({
  meta,
  agent,
}: {
  meta: Record<string, unknown>;
  agent: AgentDef;
}) {
  const confidence = (meta.confidence as number | undefined) ?? 0;
  const category = meta.category as string | undefined;
  const diff = (meta.diff as { added: number; removed: number } | undefined) ?? {
    added: 0,
    removed: 0,
  };

  return (
    <div className="space-y-5">
      {category && (
        <div
          className="rounded-xl border p-3"
          style={{
            borderColor: `${agent.accentHex}55`,
            background: `linear-gradient(180deg, ${agent.accentHex}12, transparent)`,
          }}
        >
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em]" style={{ color: agent.accentHex }}>
            <ShieldCheck className="h-3 w-3" /> Category
          </div>
          <div className="mt-1.5 text-sm font-medium">{category}</div>
        </div>
      )}

      <div>
        <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Fix confidence
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-semibold tabular-nums">
            {(confidence * 100).toFixed(0)}%
          </div>
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

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-emerald-300">
            <Plus className="h-3 w-3" /> Added
          </div>
          <div className="mt-1 text-2xl font-semibold tabular-nums text-emerald-200">
            {diff.added}
          </div>
        </div>
        <div className="rounded-lg border border-rose-400/20 bg-rose-400/5 p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-rose-300">
            <Minus className="h-3 w-3" /> Removed
          </div>
          <div className="mt-1 text-2xl font-semibold tabular-nums text-rose-200">
            {diff.removed}
          </div>
        </div>
      </div>
    </div>
  );
}