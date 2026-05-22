import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AGENTS, type AgentId, type AgentDef } from "@/lib/agents";
import {
  newMessage,
  useChatStore,
  type Thread,
  type UploadedFile,
} from "@/lib/store";
import { streamAgent } from "@/lib/mockAgents";
import { Composer, type ComposerSubmit } from "./Composer";
import { MessageBubble } from "./MessageBubble";
import { RightPanel } from "./RightPanel";
import { AgentBadge } from "./AgentBadge";
import { PanelRight, ChevronDown } from "lucide-react";

function EmptyState({ agent, onPick }: { agent: AgentDef; onPick: (s: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex max-w-2xl flex-col items-center px-6 py-16 text-center"
    >
      <AgentBadge agent={agent} size="lg" active />
      <h2 className="mt-5 text-2xl font-semibold tracking-tight">
        {agent.name}
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {agent.description}
      </p>
      <div className="mt-8 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {agent.suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="group rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left text-sm transition-all hover:border-white/10 hover:bg-white/[0.05]"
          >
            <span className="text-foreground/90 group-hover:text-foreground">
              {s}
            </span>
            <div
              className="mt-1 text-[11px]"
              style={{ color: agent.accentHex }}
            >
              Try this prompt →
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export function ChatView({ thread }: { thread: Thread }) {
  const agent = AGENTS[thread.agentId];
  const navigate = useNavigate();
  const addMessage = useChatStore((s) => s.addMessage);
  const appendToMessage = useChatStore((s) => s.appendToMessage);
  const updateMessage = useChatStore((s) => s.updateMessage);
  const addFiles = useChatStore((s) => s.addFiles);
  const setTitle = useChatStore((s) => s.setTitle);
  const createThread = useChatStore((s) => s.createThread);
  const [busy, setBusy] = useState(false);
  const [showPanel, setShowPanel] = useState(true);
  const stopRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [thread.messages]);

  const runAgent = async (prompt: string, files: UploadedFile[]) => {
    const assistant = newMessage("assistant", "", { streaming: true });
    addMessage(thread.id, assistant);
    setBusy(true);
    stopRef.current = false;

    try {
      const iter = streamAgent(agent.id, prompt);
      let result = await iter.next();
      while (!result.done) {
        if (stopRef.current) break;
        appendToMessage(thread.id, assistant.id, result.value.text);
        result = await iter.next();
      }
      const finalMeta = result.done ? result.value?.meta : undefined;
      updateMessage(thread.id, assistant.id, {
        streaming: false,
        meta: finalMeta,
      });
    } catch (e) {
      updateMessage(thread.id, assistant.id, {
        streaming: false,
        content: "_The agent encountered an error. Please try again._",
      });
      toast.error("Agent request failed");
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async ({ text, files }: ComposerSubmit) => {
    if (busy) return;
    const uploaded: UploadedFile[] = files.map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      type: f.type,
    }));
    if (uploaded.length) addFiles(thread.id, uploaded);

    const userMsg = newMessage("user", text, {
      files: uploaded.length ? uploaded : undefined,
    });
    addMessage(thread.id, userMsg);

    // Title from first message
    if (thread.messages.length === 0 && text) {
      setTitle(thread.id, text.slice(0, 48));
    }

    await runAgent(text, uploaded);
  };

  const handleSwitchAgent = (id: AgentId) => {
    const t = createThread(id);
    navigate({
      to: "/chat/$agentId/$threadId",
      params: { agentId: id, threadId: t.id },
    });
  };

  const handleRegenerate = async () => {
    const lastUser = [...thread.messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    await runAgent(lastUser.content, lastUser.files ?? []);
  };

  return (
    <div className="flex h-screen min-w-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b border-white/5 bg-background/50 px-5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <AgentBadge agent={agent} size="sm" active={busy} />
            <div className="leading-tight">
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                {agent.name}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="text-[11px] text-muted-foreground">
                {agent.tagline}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px]">
              <span
                className={`h-1.5 w-1.5 rounded-full ${busy ? "pulse-ring" : ""}`}
                style={{
                  background: busy ? agent.accentHex : "oklch(0.78 0.18 150)",
                }}
              />
              {busy ? "Agent active" : "Ready"}
            </div>
            <button
              onClick={() => setShowPanel((v) => !v)}
              className="hidden rounded-lg border border-white/10 bg-white/[0.03] p-2 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground md:block"
              aria-label="Toggle context panel"
            >
              <PanelRight className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="scrollbar-thin relative flex-1 overflow-y-auto"
        >
          <div className="mx-auto w-full max-w-3xl px-6 py-8">
            {thread.messages.length === 0 ? (
              <EmptyState
                agent={agent}
                onPick={(s) => handleSubmit({ text: s, files: [] })}
              />
            ) : (
              <div className="space-y-6">
                <AnimatePresence initial={false}>
                  {thread.messages.map((m, i) => (
                    <MessageBubble
                      key={m.id}
                      message={m}
                      agent={agent}
                      onRegenerate={
                        m.role === "assistant" &&
                        i === thread.messages.length - 1 &&
                        !m.streaming
                          ? handleRegenerate
                          : undefined
                      }
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <Composer
          agent={agent}
          onSubmit={handleSubmit}
          onSwitchAgent={handleSwitchAgent}
          busy={busy}
          onStop={() => {
            stopRef.current = true;
          }}
        />
      </div>

      {showPanel && (
        <div className="hidden md:block">
          <RightPanel agent={agent} thread={thread} busy={busy} onClose={() => setShowPanel(false)} />
        </div>
      )}
    </div>
  );
}