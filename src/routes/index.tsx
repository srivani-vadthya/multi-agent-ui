import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AGENT_LIST, type AgentId } from "@/lib/agents";
import { useChatStore } from "@/lib/store";
import nexusLogo from "@/assets/nexus-logo.svg";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const createThread = useChatStore((s) => s.createThread);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [navigate]);

  useEffect(() => {
    if (window.location.hash !== "#agents") return;
    window.setTimeout(() => {
      document.getElementById("agents")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }, []);

  const launch = (agentId: AgentId) => {
    const t = createThread(agentId);
    navigate({
      to: "/chat/$agentId/$threadId",
      params: { agentId, threadId: t.id },
    });
  };

  return (
    <div className="aurora-bg relative min-h-screen overflow-hidden">
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl border border-border bg-white shadow-lg">
            <img src={nexusLogo} alt="Nexus AI" className="h-10 w-10 object-contain" />
          </div>
          <div className="text-sm font-bold tracking-tight">Nexus AI</div>
        </div>
        <button
          onClick={() => launch("knowledge")}
          className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium shadow-sm transition-all hover:shadow-md hover:bg-secondary"
        >
          Open Workspace <ArrowRight className="h-3 w-3" />
        </button>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pt-12 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <h1 className="mt-6 text-balance text-5xl font-bold tracking-tight md:text-6xl">
            One intelligent workspace.
            <br />
            <span className="text-gradient">Four specialist agents.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-base leading-relaxed text-muted-foreground">
            Nexus unifies knowledge retrieval, root-cause analysis, code
            generation and automatic remediation in a single AI-native
            interface.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => launch("knowledge")}
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.03] hover:shadow-xl"
            >
              Launch workspace
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </motion.div>
      </main>

      <section id="agents" className="relative z-10 mx-auto max-w-6xl scroll-mt-8 px-6 pb-20">
        <div className="mb-7 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Agent details</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            Choose the right specialist for the job.
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Each Nexus AI agent is tuned for a focused workflow, so teams can move from intent to action without switching tools.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {AGENT_LIST.map((agent) => {
            const Icon = agent.icon;
            return (
              <motion.article
                key={agent.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                className="rounded-lg border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, ${agent.accentHex}26, oklch(1 0 0 / 0.86))`,
                      color: agent.accentHex,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground">{agent.name}</h3>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">{agent.tagline}</p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{agent.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => launch(agent.id)}
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition-all hover:bg-secondary"
                >
                  Start with {agent.short}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </motion.article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
