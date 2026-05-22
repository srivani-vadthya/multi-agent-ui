import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Sparkles, Trash2, Settings, User } from "lucide-react";
import { AGENT_LIST, AGENTS, type AgentId } from "@/lib/agents";
import { useChatStore } from "@/lib/store";
import { AgentBadge } from "./AgentBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppSidebar({ activeAgent }: { activeAgent: AgentId }) {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { threadId?: string };
  const order = useChatStore((s) => s.order);
  const threads = useChatStore((s) => s.threads);
  const createThread = useChatStore((s) => s.createThread);
  const deleteThread = useChatStore((s) => s.deleteThread);

  const newThread = (agentId: AgentId) => {
    const t = createThread(agentId);
    navigate({
      to: "/chat/$agentId/$threadId",
      params: { agentId, threadId: t.id },
    });
  };

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-white/5 bg-sidebar/80 backdrop-blur-xl">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-3 px-5 py-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-aurora glow-primary">
          <Sparkles className="h-4 w-4 text-background" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">Nexus AI</div>
          <div className="text-[11px] text-muted-foreground">
            Multi-Agent Platform
          </div>
        </div>
      </Link>

      {/* Agent selector */}
      <div className="px-3 pb-2">
        <div className="px-2 pb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Agents
        </div>
        <div className="space-y-1">
          {AGENT_LIST.map((a) => {
            const active = a.id === activeAgent;
            return (
              <button
                key={a.id}
                onClick={() => newThread(a.id)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl border px-2.5 py-2 text-left transition-all",
                  active
                    ? "border-white/10 bg-white/5"
                    : "border-transparent hover:border-white/5 hover:bg-white/[0.03]"
                )}
              >
                <AgentBadge agent={a} size="sm" active={active} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{a.short}</div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {a.tagline}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-3 my-2 h-px bg-white/5" />

      {/* New chat */}
      <div className="px-3">
        <Button
          onClick={() => newThread(activeAgent)}
          className="w-full justify-start gap-2 rounded-xl bg-white/5 text-foreground hover:bg-white/10"
          variant="ghost"
        >
          <Plus className="h-4 w-4" />
          New conversation
        </Button>
      </div>

      {/* History */}
      <div className="mt-4 flex min-h-0 flex-1 flex-col px-3">
        <div className="px-2 pb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Recent
        </div>
        <div className="scrollbar-thin flex-1 overflow-y-auto pr-1">
          {order.length === 0 && (
            <div className="px-2 py-6 text-xs text-muted-foreground">
              No conversations yet. Start one above.
            </div>
          )}
          <motion.ul layout className="space-y-1">
            {order.map((id) => {
              const t = threads[id];
              if (!t) return null;
              const agent = AGENTS[t.agentId];
              const active = params.threadId === id;
              return (
                <motion.li
                  layout
                  key={id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    className={cn(
                      "group flex items-center gap-2 rounded-lg px-2 py-2 transition-colors",
                      active
                        ? "bg-white/[0.06]"
                        : "hover:bg-white/[0.03]"
                    )}
                  >
                    <Link
                      to="/chat/$agentId/$threadId"
                      params={{ agentId: t.agentId, threadId: t.id }}
                      className="flex min-w-0 flex-1 items-center gap-2"
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: agent.accentHex }}
                      />
                      <span className="truncate text-sm">{t.title}</span>
                    </Link>
                    <button
                      onClick={() => {
                        deleteThread(id);
                        if (active) navigate({ to: "/" });
                      }}
                      className="opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      </div>

      {/* Profile */}
      <div className="border-t border-white/5 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-aurora text-xs font-semibold text-background">
            AV
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-sm">Alex Vance</div>
            <div className="truncate text-[11px] text-muted-foreground">
              Director, Platform
            </div>
          </div>
          <button className="rounded-md p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}