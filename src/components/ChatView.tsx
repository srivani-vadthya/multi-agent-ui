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
import { Check, ChevronDown, Copy, Download, FileSearch, MoreVertical, Paperclip, RefreshCw, Sparkles, X } from "lucide-react";
import robotImage from "@/assets/robot.png";

type Citation = {
  title: string;
  page: number | string;
  score: number;
};

function normalizeConfidence(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return value > 1 ? value / 100 : value;
}

function shouldHideKnowledgeEvidence(content: string, meta?: Record<string, unknown>) {
  if (meta?.hideEvidence === true) return true;
  if (meta?.isFromDocuments !== true) return true;

  const normalized = content.trim();
  if (!normalized) return true;

  const responseType =
    typeof meta?.responseType === "string" ? meta.responseType.toLowerCase() : "";
  if (/(greeting|small[_ -]?talk|casual|not[_ -]?found|no[_ -]?answer|out[_ -]?of[_ -]?scope)/.test(responseType)) {
    return true;
  }

  const greetingPattern =
    /^(hi|hello|hey|good morning|good afternoon|good evening|greetings)[!. ,]*(how can i (assist|help)|what can i do|how may i)/i;
  const notFoundPattern =
    /(could not find|couldn't find|not found|no relevant|no matching|not available in (the )?(indexed )?documents|not present in (the )?(indexed )?documents|i don't know|i do not know|unable to find|cannot find|no answer)/i;

  return greetingPattern.test(normalized) || notFoundPattern.test(normalized);
}

function KnowledgeEvidence({ content, meta }: { content: string; meta?: Record<string, unknown> }) {
  if (shouldHideKnowledgeEvidence(content, meta)) return null;

  const confidence = normalizeConfidence(meta?.confidence);
  const confidenceLabel =
    typeof meta?.confidenceLabel === "string"
      ? meta.confidenceLabel.toUpperCase()
      : confidence === undefined
        ? undefined
        : confidence >= 0.8
          ? "HIGH"
          : confidence >= 0.55
            ? "MEDIUM"
            : "LOW";
  const citations = ((meta?.citations as Citation[] | undefined) ?? []).filter(
    (citation) => citation.title
  );

  if (citations.length === 0 || confidence === undefined) return null;

  const confidenceColor =
    confidence === undefined || confidence >= 0.55
      ? "oklch(0.66 0.16 154)"
      : "oklch(0.62 0.2 28)";

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-background/80">
      <div className="bg-secondary/70 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-foreground">Answer Confidence:</span>
          {confidence !== undefined && (
            <span
              className="rounded-2xl px-4 py-2 text-sm font-bold text-white shadow-sm"
              style={{ background: confidenceColor }}
            >
              {(confidence * 100).toFixed(1)}% - {confidenceLabel}
            </span>
          )}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Answer is from indexed documents
        </p>
        <p className="mt-3 text-xs italic leading-5 text-muted-foreground">
          The answer is reasonably supported by the retrieved chunks, though some parts may be summarized or loosely phrased.
        </p>
      </div>

      <details className="group" open>
        <summary className="flex cursor-pointer list-none items-center gap-2 border-t border-border px-4 py-3 text-sm font-medium text-foreground sm:px-5">
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
          <span>View Sources ({citations.length} documents)</span>
        </summary>
        {citations.length > 0 ? (
          <div className="space-y-3 px-4 pb-4 pt-2 sm:px-5">
            {citations.map((citation, index) => (
              <div
                key={`${citation.title}-${citation.page}-${index}`}
                className="rounded-xl border-l-4 bg-secondary/50 px-4 py-4"
                style={{ borderLeftColor: "oklch(0.68 0.16 246)" }}
              >
                <div className="font-semibold text-foreground">{citation.title}</div>
                <div className="mt-3 text-sm text-muted-foreground">
                  Page {citation.page || "-"} - Relevance: {(normalizeConfidence(citation.score) ?? 0) * 100 > 0
                    ? `${((normalizeConfidence(citation.score) ?? 0) * 100).toFixed(1)}%`
                    : "Not scored"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 pb-5 pt-2 text-sm text-muted-foreground">
            <FileSearch className="mb-2 h-5 w-5" />
            No source documents were returned for this answer.
          </div>
        )}
      </details>
    </div>
  );
}

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
        className="flex w-full justify-end"
      >
        <div className="min-w-0 max-w-[78%] overflow-hidden rounded-2xl rounded-br-md border border-border/70 bg-card px-4 py-3 text-foreground shadow-[0_12px_35px_oklch(0_0_0_/_0.06)]">
          <div className="whitespace-pre-wrap break-words text-[15px] font-normal leading-relaxed [overflow-wrap:anywhere]">
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
      className="flex w-full justify-start gap-3"
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
      <div className="min-w-0 max-w-[85%] flex-1">
        <div className="min-w-0 overflow-hidden rounded-2xl rounded-tl-md border border-border/70 bg-card px-4 py-3 shadow-[0_12px_35px_oklch(0_0_0_/_0.06)]">
          {message.content === "" && message.streaming ? (
            <span className="text-muted-foreground font-medium">Thinking…</span>
          ) : (
            <div className="min-w-0 break-words text-[15px] font-normal leading-relaxed text-foreground [overflow-wrap:anywhere]">
              <Markdown plainCodeBlocks={agent.id === "rca"}>{message.content}</Markdown>
              {agent.id === "knowledge" && !message.streaming && (
                <KnowledgeEvidence content={message.content} meta={message.meta} />
              )}
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
      file: f,
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
    <div className="aurora-bg flex h-screen min-w-0 flex-col overflow-hidden">
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
        className="scrollbar-thin flex-1 overflow-y-auto overflow-x-hidden px-4 py-6"
      >
        <div className="mx-auto min-h-full w-full max-w-4xl space-y-6 overflow-x-hidden">
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
