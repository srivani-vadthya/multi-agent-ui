import { motion, AnimatePresence } from "framer-motion";
import { Activity, FileText, X } from "lucide-react";
import type { AgentDef } from "@/lib/agents";
import type { Thread, Message } from "@/lib/store";
import { KnowledgePanel } from "./panels/KnowledgePanel";
import { RcaPanel } from "./panels/RcaPanel";
import { CodegenPanel } from "./panels/CodegenPanel";
import { AutofixPanel } from "./panels/AutofixPanel";

export function RightPanel({
  agent,
  thread,
  busy,
  onClose,
}: {
  agent: AgentDef;
  thread: Thread;
  busy: boolean;
  onClose?: () => void;
}) {
  // Latest assistant message meta
  const lastAssistant = [...thread.messages]
    .reverse()
    .find((m) => m.role === "assistant" && m.content) as Message | undefined;
  const meta = (lastAssistant?.meta ?? {}) as Record<string, unknown>;

  return (
    <aside className="flex h-screen w-[360px] shrink-0 flex-col border-l border-white/5 bg-card/40 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ background: agent.accentHex, boxShadow: `0 0 12px ${agent.accentHex}` }}
          />
          <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Agent Context
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-white/5 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto">
        {/* Status */}
        <div className="border-b border-white/5 px-5 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Activity className="h-3.5 w-3.5" style={{ color: agent.accentHex }} />
            <span className="font-medium">{agent.name}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span
              className={`h-1.5 w-1.5 rounded-full ${busy ? "pulse-ring" : ""}`}
              style={{ background: busy ? agent.accentHex : "oklch(0.78 0.18 150)" }}
            />
            {busy ? "Processing…" : "Ready"}
          </div>
        </div>

        {/* Files */}
        {thread.files.length > 0 && (
          <div className="border-b border-white/5 px-5 py-4">
            <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Attached files
            </div>
            <ul className="space-y-1.5">
              {thread.files.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-2 text-xs"
                >
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{f.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {(f.size / 1024).toFixed(0)} KB
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={agent.id + (lastAssistant?.id ?? "")}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="px-5 py-4"
          >
            {agent.id === "knowledge" && <KnowledgePanel meta={meta} agent={agent} />}
            {agent.id === "rca" && <RcaPanel meta={meta} agent={agent} />}
            {agent.id === "codegen" && <CodegenPanel meta={meta} agent={agent} />}
            {agent.id === "autofix" && <AutofixPanel meta={meta} agent={agent} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </aside>
  );
}