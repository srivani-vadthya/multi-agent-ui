import type { AgentDef } from "@/lib/agents";
import { AlertTriangle, GitBranch } from "lucide-react";

type Node = { id: string; label: string; status: "ok" | "warn" | "error" };

const STATUS_COLOR: Record<Node["status"], string> = {
  ok: "oklch(0.78 0.18 150)",
  warn: "oklch(0.80 0.18 80)",
  error: "oklch(0.68 0.24 22)",
};

const POS: Record<string, [number, number]> = {
  edge: [40, 40],
  auth: [180, 60],
  cache: [180, 140],
  redis: [310, 140],
  db: [310, 60],
};

export function RcaPanel({
  meta,
  agent,
}: {
  meta: Record<string, unknown>;
  agent: AgentDef;
}) {
  const rootCause = (meta.rootCause as string | undefined) ?? null;
  const confidence = (meta.confidence as number | undefined) ?? 0;
  const nodes = (meta.nodes as Node[] | undefined) ?? [];
  const edges = (meta.edges as [string, string][] | undefined) ?? [];
  const steps = (meta.steps as string[] | undefined) ?? [];

  return (
    <div className="space-y-5">
      {rootCause && (
        <div
          className="rounded-xl border p-3"
          style={{
            borderColor: `${agent.accentHex}55`,
            background: `linear-gradient(180deg, ${agent.accentHex}12, transparent)`,
          }}
        >
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em]" style={{ color: agent.accentHex }}>
            <AlertTriangle className="h-3 w-3" /> Probable root cause
          </div>
          <div className="mt-1.5 text-sm font-medium">{rootCause}</div>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${confidence * 100}%`, background: agent.accentHex }}
              />
            </div>
            <div className="text-[11px] tabular-nums text-muted-foreground">
              {(confidence * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      )}

      {nodes.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <GitBranch className="h-3 w-3" /> Dependency graph
          </div>
          <div className="rounded-xl border border-white/5 bg-black/30 p-2">
            <svg viewBox="0 0 360 200" className="w-full">
              {edges.map(([a, b], i) => {
                const pa = POS[a], pb = POS[b];
                if (!pa || !pb) return null;
                return (
                  <line
                    key={i}
                    x1={pa[0]} y1={pa[1]} x2={pb[0]} y2={pb[1]}
                    stroke="oklch(1 0 0 / 0.15)" strokeWidth={1.5}
                  />
                );
              })}
              {nodes.map((n) => {
                const p = POS[n.id] ?? [0, 0];
                const color = STATUS_COLOR[n.status];
                return (
                  <g key={n.id}>
                    <circle cx={p[0]} cy={p[1]} r={18} fill={`${color}22`} stroke={color} strokeWidth={1.5} />
                    {n.status !== "ok" && (
                      <circle cx={p[0]} cy={p[1]} r={18} fill="none" stroke={color} strokeWidth={1} opacity={0.5}>
                        <animate attributeName="r" from="18" to="28" dur="1.6s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.6" to="0" dur="1.6s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <text x={p[0]} y={p[1] + 34} textAnchor="middle" fontSize="9" fill="oklch(0.8 0.02 270)" fontFamily="ui-monospace">
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {steps.length > 0 && (
        <div>
          <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Reasoning chain
          </div>
          <ol className="space-y-2">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-xs">
                <span
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold"
                  style={{ background: `${agent.accentHex}22`, color: agent.accentHex }}
                >
                  {i + 1}
                </span>
                <span className="leading-5 text-foreground/85">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}