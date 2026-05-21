import type { AgentDef } from "@/lib/agents";

export function AgentBadge({
  agent,
  size = "md",
  active = false,
}: {
  agent: AgentDef;
  size?: "sm" | "md" | "lg";
  active?: boolean;
}) {
  const Icon = agent.icon;
  const dim =
    size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const icon =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";
  return (
    <div
      className={`${dim} relative grid place-items-center rounded-xl border border-white/10`}
      style={{
        background: `linear-gradient(135deg, ${agent.accentHex}22, ${agent.accentHex}08)`,
        boxShadow: active ? `0 0 24px ${agent.accentHex}55` : undefined,
      }}
    >
      <Icon className={icon} style={{ color: agent.accentHex }} />
      {active && (
        <span
          className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full pulse-ring"
          style={{ background: agent.accentHex }}
        />
      )}
    </div>
  );
}