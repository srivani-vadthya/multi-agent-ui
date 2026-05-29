import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AGENTS, type AgentId } from "@/lib/agents";
import {
  newMessage,
  useChatStore,
  type Thread,
  type UploadedFile,
} from "@/lib/store";
import { streamAgent } from "@/lib/mockAgents";
import { Composer, type ComposerSubmit } from "./Composer";
import { Markdown } from "./Markdown";
import { Check, Copy, Download, MoreVertical, Paperclip, RefreshCw, Sparkles, X } from "lucide-react";
import robotImage from "@/assets/robot.png";

function MessageBubble({ message, agent, onRegenerate }: any) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const copy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadReport = () => {
    const blob = new Blob([message.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agent.id}_report_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Report downloaded successfully');
  };

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div className="max-w-[78%] rounded-2xl rounded-br-md border border-border/70 bg-card px-4 py-3 text-foreground shadow-[0_12px_35px_oklch(0_0_0_/_0.06)]">
          <div className="whitespace-pre-wrap text-[15px] font-normal leading-relaxed">
            {message.content || (message.files?.length ? "Uploaded documents" : "")}
          </div>
          {message.files?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.files.map((file: UploadedFile) => (
                <span
                  key={file.id}
                  className="inline-flex max-w-56 items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground"
                >
                  <Paperclip className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{file.name}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/80 shadow-sm"
        style={{ background: `linear-gradient(135deg, ${agent.accentHex}28, oklch(1 0 0 / 0.9))` }}
      >
        <img 
          src={robotImage} 
          alt="AI" 
          className="h-6 w-6 object-cover"
        />
      </div>
      <div className="max-w-[85%] flex-1">
        <div className="rounded-2xl rounded-tl-md border border-border/70 bg-card px-4 py-3 shadow-[0_12px_35px_oklch(0_0_0_/_0.06)]">
          {message.content === "" && message.streaming ? (
            <span className="text-muted-foreground font-medium">Thinking…</span>
          ) : (
            <div className="text-[15px] leading-relaxed text-foreground font-normal">
              <Markdown>{message.content}</Markdown>
            </div>
          )}
        </div>
        {!message.streaming && message.content && (
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={copy}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
            {agent.id === "rca" && (
              <button
                onClick={downloadReport}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Download className="h-3 w-3" /> Download Report
              </button>
            )}
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <RefreshCw className="h-3 w-3" /> Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function ChatView({ thread }: { thread: Thread }) {
  const agent = AGENTS[thread.agentId];
  const AgentIcon = agent.icon;
  const navigate = useNavigate();
  const addMessage = useChatStore((s) => s.addMessage);
  const appendToMessage = useChatStore((s) => s.appendToMessage);
  const updateMessage = useChatStore((s) => s.updateMessage);
  const addFiles = useChatStore((s) => s.addFiles);
  const setTitle = useChatStore((s) => s.setTitle);
  const createThread = useChatStore((s) => s.createThread);
  const [busy, setBusy] = useState(false);
  const stopRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      const iter = streamAgent(agent.id, prompt, files);
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
    <div className="aurora-bg flex h-screen flex-col">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-border/70 bg-background/85 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div
            className="grid h-9 w-9 place-items-center rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${agent.accentHex}35, oklch(1 0 0 / 0.8))`,
              color: agent.accentHex,
            }}
          >
            <AgentIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">AI ChatBot</h1>
            <p className="text-xs font-medium text-muted-foreground">{agent.short} workspace</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" aria-label="More options">
            <MoreVertical className="h-5 w-5" />
          </button>
          <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="scrollbar-thin flex-1 overflow-y-auto px-4 py-6"
      >
        <div className="mx-auto min-h-full w-full max-w-4xl space-y-6">
          {thread.messages.length === 0 ? (
            <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div
                  className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/80 shadow-[0_18px_45px_oklch(0_0_0_/_0.08)]"
                  style={{ background: `linear-gradient(135deg, ${agent.accentHex}35, oklch(1 0 0 / 0.95))` }}
                >
                  <img 
                    src={robotImage} 
                    alt="AI" 
                    className="h-12 w-12 object-cover"
                  />
                </div>
                <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" style={{ color: agent.accentHex }} />
                  Ready for a new task
                </div>
                <h2 className="text-3xl font-bold text-foreground">{agent.name}</h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{agent.description}</p>
              </motion.div>
            </div>
          ) : (
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
          )}
        </div>
      </div>

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
  );
}
