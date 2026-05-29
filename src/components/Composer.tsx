import { useRef, useState, type KeyboardEvent } from "react";
import { ChevronDown, Paperclip, Send, Square, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AGENT_LIST, type AgentId, type AgentDef } from "@/lib/agents";
import { AgentBadge } from "./AgentBadge";

export interface ComposerSubmit {
  text: string;
  files: File[];
}

export function Composer({
  agent,
  onSubmit,
  onSwitchAgent,
  busy,
  onStop,
}: {
  agent: AgentDef;
  onSubmit: (data: ComposerSubmit) => void;
  onSwitchAgent?: (id: AgentId) => void;
  busy?: boolean;
  onStop?: () => void;
}) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [agentMenu, setAgentMenu] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed && files.length === 0) return;
    onSubmit({ text: trimmed, files });
    setText("");
    setFiles([]);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-border/70 bg-background/85 px-4 py-4 backdrop-blur-xl sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="group relative rounded-[28px] border border-border/80 bg-card px-3 py-2 shadow-[0_18px_45px_oklch(0_0_0_/_0.08)] transition-all duration-200 focus-within:border-primary/50 focus-within:shadow-[0_20px_55px_oklch(0.55_0.22_264_/_0.16)] sm:px-4">
          <div
            className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-200 group-focus-within:opacity-100"
            style={{
              background: `linear-gradient(135deg, ${agent.accentHex}12, transparent 42%, oklch(1 0 0 / 0.75))`,
            }}
          />
          {files.length > 0 && (
            <div className="relative flex flex-wrap gap-2 px-1 pb-2 pt-1">
              {files.map((file, index) => (
                <span
                  key={`${file.name}-${index}`}
                  className="inline-flex max-w-56 items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs text-foreground"
                >
                  <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="grid h-4 w-4 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="relative flex min-h-12 items-center gap-2 sm:gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <input
              ref={fileRef}
              type="file"
              multiple
              hidden
              onChange={(e) => {
                if (e.target.files) setFiles((f) => [...f, ...Array.from(e.target.files!)]);
                e.target.value = "";
              }}
            />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKey}
              placeholder="Type your message..."
              className="relative min-w-0 flex-1 bg-transparent text-[15px] font-normal text-foreground placeholder:text-muted-foreground focus:outline-none"
              autoFocus
            />

            <div className="relative shrink-0">
            <button
              onClick={() => setAgentMenu((v) => !v)}
              className="relative hidden h-11 items-center gap-2 rounded-full border border-border bg-background/80 px-3 text-sm font-semibold text-foreground transition-all hover:border-primary/30 hover:bg-secondary sm:flex"
            >
              <AgentBadge agent={agent} size="sm" />
              <span>{agent.short}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setAgentMenu((v) => !v)}
              className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-background/80 text-foreground transition-all hover:border-primary/30 hover:bg-secondary sm:hidden"
              aria-label="Select agent"
            >
              <AgentBadge agent={agent} size="sm" />
            </button>
            <AnimatePresence>
              {agentMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="absolute bottom-[calc(100%+12px)] right-0 z-30 w-72 rounded-2xl border border-border bg-card p-2 shadow-[0_22px_55px_oklch(0_0_0_/_0.16)]"
                >
                  {AGENT_LIST.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        setAgentMenu(false);
                        onSwitchAgent?.(a.id);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary"
                    >
                      <AgentBadge agent={a} size="sm" />
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{a.name}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {a.tagline}
                        </div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            </div>

            <button
              onClick={busy ? () => onStop?.() : submit}
              disabled={!busy && !text.trim() && files.length === 0}
              className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full text-white shadow-lg transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-45"
              style={{
                background: busy
                  ? "oklch(0.55 0.22 25)"
                  : `linear-gradient(135deg, ${agent.accentHex}, var(--color-primary))`,
                boxShadow: `0 12px 28px ${agent.accentHex}40`,
              }}
              aria-label={busy ? "Stop response" : "Send"}
            >
              {busy ? <Square className="h-4 w-4 fill-current" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
