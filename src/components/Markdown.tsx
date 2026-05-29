import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

function CodeBlock({
  inline,
  className,
  children,
  ...props
}: {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const code = String(children ?? "").replace(/\n$/, "");
  const lang = /language-(\w+)/.exec(className ?? "")?.[1];

  if (inline) {
    return (
      <code
        className="rounded-md border border-border bg-secondary px-1.5 py-0.5 font-mono text-[0.9em] font-medium text-foreground"
        {...props}
      >
        {children}
      </code>
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
      <pre className="scrollbar-thin overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono">
          {isDiff
            ? code.split("\n").map((line, i) => {
                const cls = line.startsWith("+")
                  ? "text-emerald-300 bg-emerald-400/5"
                  : line.startsWith("-")
                    ? "text-rose-300 bg-rose-400/5"
                    : "text-foreground/85";
                return (
                  <div key={i} className={`-mx-4 px-4 ${cls}`}>
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

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-chat">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock as never,
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
            <p className="my-4 leading-relaxed text-foreground font-normal">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-4 list-disc space-y-2 pl-6 text-foreground leading-relaxed font-normal">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 list-decimal space-y-2 pl-6 text-foreground leading-relaxed font-normal">{children}</ol>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-accent underline-offset-2 hover:underline"
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