import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  plainText?: boolean;
}

function CodeBlock({
  inline,
  className,
  children,
  plainText = false,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const code = String(children ?? "").replace(/\n$/, "");
  const lang = /language-(\w+)/.exec(className ?? "")?.[1];

  if (inline) {
    return (
      <code
        className="rounded-md border border-border bg-secondary px-1.5 py-0.5 font-mono text-[0.9em] font-medium text-foreground break-words [overflow-wrap:anywhere]"
        {...props}
      >
        {children}
      </code>
    );
  }

  // For plain text rendering (e.g., RCA agent)
  if (plainText) {
    return (
      <div className="my-2 whitespace-pre-wrap break-words text-[13px] leading-relaxed [overflow-wrap:anywhere]">
        {code}
      </div>
    );
  }

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isDiff = lang === "diff";

  return (
    <div className="group my-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-secondary px-4 py-2">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {lang ?? "code"}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-hidden whitespace-pre-wrap break-words p-4 text-[13px] leading-relaxed [overflow-wrap:anywhere]">
        <code className="font-mono break-words [overflow-wrap:anywhere]">
          {isDiff
            ? code.split("\n").map((line, i) => {
                const cls = line.startsWith("+")
                  ? "text-emerald-300 bg-emerald-400/5"
                  : line.startsWith("-")
                    ? "text-rose-300 bg-rose-400/5"
                    : "text-foreground/85";
                return (
                  <div key={i} className={`-mx-4 break-words px-4 [overflow-wrap:anywhere] ${cls}`}>
                    {line || " "}
                  </div>
                );
              })
            : code}
        </code>
      </pre>
    </div>
  );
}

export function Markdown({ children, plainCodeBlocks = false }: { children: string; plainCodeBlocks?: boolean }) {
  const PlainTextCodeBlock = (props: CodeBlockProps) => (
    <CodeBlock {...props} plainText={plainCodeBlocks} />
  );

  return (
    <div className="prose-chat min-w-0 overflow-x-hidden break-words [overflow-wrap:anywhere]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: PlainTextCodeBlock as never,
          h1: ({ children }) => (
            <h1 className="mb-4 mt-6 text-2xl font-bold tracking-tight">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-6 text-xl font-bold tracking-tight">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-5 text-lg font-semibold tracking-tight">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="my-4 break-words font-normal leading-relaxed text-foreground [overflow-wrap:anywhere]">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-4 list-disc space-y-2 break-words pl-6 font-normal leading-relaxed text-foreground [overflow-wrap:anywhere]">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 list-decimal space-y-2 break-words pl-6 font-normal leading-relaxed text-foreground [overflow-wrap:anywhere]">{children}</ol>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="break-words text-accent underline-offset-2 hover:underline [overflow-wrap:anywhere]"
              target="_blank"
              rel="noreferrer"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-foreground">{children}</strong>
          ),
          hr: () => <hr className="my-6 border-border" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
