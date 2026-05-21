import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Shield, Layers } from "lucide-react";
import { AGENT_LIST, type AgentId } from "@/lib/agents";
import { useChatStore } from "@/lib/store";
import { AgentBadge } from "@/components/AgentBadge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexus AI — Enterprise Multi-Agent Platform" },
      {
        name: "description",
        content:
          "A centralized AI workspace for enterprise teams. Four specialized agents — knowledge, root cause, code generation, and auto-fix — in one futuristic interface.",
      },
      { property: "og:title", content: "Nexus AI — Enterprise Multi-Agent Platform" },
      {
        property: "og:description",
        content: "One intelligent workspace. Four specialist agents.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const createThread = useChatStore((s) => s.createThread);

  const launch = (agentId: AgentId) => {
    const t = createThread(agentId);
    navigate({
      to: "/chat/$agentId/$threadId",
      params: { agentId, threadId: t.id },
    });
  };

  return (
    <div className="aurora-bg relative min-h-screen overflow-hidden">
      {/* Decorative grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0 / 1) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
        }}
      />

      {/* Top nav */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-aurora glow-primary">
            <Sparkles className="h-4 w-4 text-background" />
          </div>
          <div className="text-sm font-semibold tracking-tight">Nexus AI</div>
        </div>
        <button
          onClick={() => launch("knowledge")}
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium transition-colors hover:bg-white/[0.08]"
        >
          Open Workspace <ArrowRight className="h-3 w-3" />
        </button>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pt-12 pb-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-muted-foreground">
            <span className="pulse-ring h-1.5 w-1.5 rounded-full bg-primary" />
            Enterprise Multi-Agent Platform · v1.0
          </div>
          <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight md:text-6xl">
            One intelligent workspace.
            <br />
            <span className="text-gradient">Four specialist agents.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground">
            Nexus unifies knowledge retrieval, root-cause analysis, code
            generation and automatic remediation in a single AI-native
            interface — built for the way enterprise teams actually work.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => launch("knowledge")}
              className="group inline-flex items-center gap-2 rounded-full bg-aurora px-5 py-2.5 text-sm font-semibold text-background transition-transform hover:scale-[1.03]"
            >
              Launch workspace
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <a
              href="#agents"
              className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-foreground/90 transition-colors hover:bg-white/[0.06]"
            >
              Meet the agents
            </a>
          </div>
        </motion.div>

        {/* Agent grid */}
        <div id="agents" className="mt-24">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                The agents
              </div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Each agent. Its own surface.
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {AGENT_LIST.map((a, i) => (
              <motion.button
                key={a.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 * i, ease: "easeOut" }}
                onClick={() => launch(a.id)}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-left transition-all hover:border-white/20 hover:bg-white/[0.04]"
              >
                <div
                  className="absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-30 blur-3xl transition-opacity group-hover:opacity-60"
                  style={{ background: a.accentHex }}
                />
                <div className="relative flex items-start gap-4">
                  <AgentBadge agent={a} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold tracking-tight">{a.name}</h3>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                      {a.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Pillars */}
        <div className="mt-24 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { icon: Layers, title: "Unified workspace", body: "Switch agents without losing context. One sidebar, one composer, four specialists." },
            { icon: Zap, title: "Streaming reasoning", body: "Token-level streaming, animated steps and live tool execution surfaces." },
            { icon: Shield, title: "Enterprise-ready", body: "Pluggable API layer that connects directly to your private deployments." },
          ].map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * i }}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-5"
            >
              <p.icon className="h-4 w-4 text-primary" />
              <div className="mt-3 text-sm font-semibold">{p.title}</div>
              <div className="mt-1 text-[13px] leading-6 text-muted-foreground">{p.body}</div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
