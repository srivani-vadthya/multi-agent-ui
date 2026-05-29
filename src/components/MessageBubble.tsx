import { motion } from "framer-motion";
import { Copy, RefreshCw, Check, FileText } from "lucide-react";
import { useState } from "react";
import type { Message } from "@/lib/store";
import type { AgentDef } from "@/lib/agents";
import { Markdown } from "./Markdown";
import { AgentBadge } from "./AgentBadge";

export function MessageBubble({
  message,
  agent,
  onRegenerate,
}: {
  message: Message;
  agent: AgentDef;
  onRegenerate?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const copy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex w-full gap-4 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && <AgentBadge agent={agent} size="sm" />}

      <div className={`min-w-0 max-w-[calc(100%-4rem)] ${isUser ? "items-end" : ""} flex flex-col`}>
        {isUser ? (
          <div className="rounded-2xl rounded-tr-md bg-card border border-border px-5 py-3.5 text-foreground shadow-sm">
            <div className="whitespace-pre-wrap text-[15px] leading-relaxed font-normal">{message.content}</div>
            {message.files && message.files.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {message.files.map((f) => (
                  <span
                    key={f.id}
                    className="inline-flex items-center gap-1 rounded-md bg-secondary border border-border px-2 py-1 text-xs font-medium"
                  >
                    <FileText className="h-3 w-3" /> {f.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-[15px] leading-relaxed text-foreground">
            {message.content === "" && message.streaming ? (
              <span className="shimmer-text font-medium">Thinking…</span>
            ) : (
              <Markdown>{message.content}</Markdown>
            )}
            {!message.streaming && message.content && (
              <div className="mt-3 flex items-center gap-1 text-muted-foreground">
                <button
                  onClick={copy}
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}