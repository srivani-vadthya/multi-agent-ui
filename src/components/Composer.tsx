import { useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { Paperclip, ArrowUp, Mic, Square, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AGENT_LIST, AGENTS, type AgentId, type AgentDef } from "@/lib/agents";
import { useNavigate } from "@tanstack/react-router";
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
  const [drag, setDrag] = useState(false);
  const [agentMenu, setAgentMenu] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed && files.length === 0) return;
    onSubmit({ text: trimmed, files });
    setText("");
    setFiles([]);
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) setFiles((f) => [...f, ...dropped]);
  };

  return (
    <div className="px-4 pb-5 pt-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`glass relative mx-auto w-full max-w-3xl rounded-2xl p-1.5 transition-all ${
          drag ? "ring-2 ring-primary/60" : ""
        }`}
      >
        {/* File chips */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-1.5 px-3 pt-2"
            >
              {files.map((f, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px]"
                >
                  {f.name}
                  <button
                    onClick={() => setFiles((arr) => arr.filter((_, j) => j !== i))}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          rows={1}
          placeholder={`Ask ${agent.short}…`}
          className="scrollbar-thin max-h-48 w-full resize-none bg-transparent px-4 py-3 text-[14.5px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          style={{ minHeight: "52px" }}
          autoFocus
        />

        <div className="flex items-center justify-between gap-2 px-2 pb-1.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => fileRef.current?.click()}
              className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              aria-label="Attach file"
            >
              <Paperclip className="h-4 w-4" />
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

            {/* Agent switcher */}
            <div className="relative">
              <button
                onClick={() => setAgentMenu((v) => !v)}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-white/[0.06]"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: agent.accentHex }}
                />
                {agent.short}
              </button>
              <AnimatePresence>
                {agentMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="glass absolute bottom-[calc(100%+8px)] left-0 z-30 w-64 rounded-xl p-1.5"
                  >
                    {AGENT_LIST.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          setAgentMenu(false);
                          onSwitchAgent?.(a.id);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm hover:bg-white/5"
                      >
                        <AgentBadge agent={a} size="sm" />
                        <div className="min-w-0">
                          <div className="truncate font-medium">{a.name}</div>
                          <div className="truncate text-[11px] text-muted-foreground">
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
              className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              aria-label="Voice input"
            >
              <Mic className="h-4 w-4" />
            </button>
          </div>

          {busy ? (
            <button
              onClick={onStop}
              className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-foreground transition-all hover:bg-white/15"
              aria-label="Stop"
            >
              <Square className="h-3.5 w-3.5" fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!text.trim() && files.length === 0}
              className="grid h-9 w-9 place-items-center rounded-lg bg-aurora text-background shadow-lg transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
              aria-label="Send"
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {drag && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-2xl bg-primary/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" /> Drop files to attach
            </div>
          </div>
        )}
      </div>
      <div className="mx-auto mt-2 max-w-3xl px-2 text-center text-[11px] text-muted-foreground">
        Nexus AI may produce inaccurate information. Verify critical outputs.
      </div>
    </div>
  );
}