import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { MessageSquare, Users, FileText, MessageCircle, Settings, Sparkles, LogOut, PanelLeftClose, PanelLeft, Trash2 } from "lucide-react";
import { AGENT_LIST, AGENTS, type AgentId } from "@/lib/agents";
import { useChatStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import nexusLogo from "@/assets/nexus-logo.svg";

export function AppSidebar({ activeAgent }: { activeAgent: AgentId }) {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { threadId?: string };
  const createThread = useChatStore((s) => s.createThread);
  const deleteThread = useChatStore((s) => s.deleteThread);
  const threads = useChatStore((s) => s.threads);
  const order = useChatStore((s) => s.order);
  const [collapsed, setCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAgents, setShowAgents] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [user, setUser] = useState({ name: "User", email: "user@example.com" });
  const userInitials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const uploadedDocs = order.flatMap((threadId) => {
    const thread = threads[threadId];
    if (!thread) return [];
    return thread.files.map((file) => ({
      ...file,
      threadId,
      threadTitle: thread.title,
      agentId: thread.agentId,
    }));
  });

  const formatSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;

    try {
      const storedUser = JSON.parse(userStr);
      if (storedUser?.name && storedUser?.email) {
        setUser({ name: storedUser.name, email: storedUser.email });
      }
    } catch {
      localStorage.removeItem("user");
    }
  }, []);

  const newThread = (agentId: AgentId) => {
    const t = createThread(agentId);
    navigate({
      to: "/chat/$agentId/$threadId",
      params: { agentId, threadId: t.id },
    });
  };

  const removeThread = (id: string) => {
    const nextId = order.find((threadId) => threadId !== id);
    const nextThread = nextId ? threads[nextId] : undefined;
    deleteThread(id);

    if (params.threadId !== id) return;

    if (nextThread) {
      navigate({
        to: "/chat/$agentId/$threadId",
        params: { agentId: nextThread.agentId, threadId: nextThread.id },
      });
      return;
    }

    const t = createThread(activeAgent);
    navigate({
      to: "/chat/$agentId/$threadId",
      params: { agentId: activeAgent, threadId: t.id },
    });
  };

  const goToAgentDetails = () => {
    navigate({ to: "/" });
    if (typeof window === "undefined") return;
    window.setTimeout(() => {
      document.getElementById("agents")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate({ to: "/login" });
  };

  return (
    <aside className={cn(
      "flex h-screen shrink-0 flex-col bg-card border-r border-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-lg border border-border bg-white shadow-sm">
              <img src={nexusLogo} alt="Nexus AI" className="h-8 w-8 object-contain" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold">Nexus AI</div>
              <div className="text-[10px] text-muted-foreground">
                Multi-Agent Platform
              </div>
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "rounded-lg p-2 text-muted-foreground hover:bg-secondary",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {!collapsed && (
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            <button 
              onClick={() => newThread(activeAgent)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-primary bg-primary/10"
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </button>
            
            <button 
              onClick={() => setShowAgents(!showAgents)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Users className="h-4 w-4" />
              Agents
            </button>
            
            {showAgents && (
              <div className="ml-6 space-y-1 border-l-2 border-border pl-3">
                {AGENT_LIST.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => newThread(a.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                      activeAgent === a.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: a.accentHex }} />
                    {a.short}
                  </button>
                ))}
              </div>
            )}
            
            <button
              onClick={() => setShowDocs(!showDocs)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary hover:text-foreground",
                showDocs ? "bg-secondary text-foreground" : "text-muted-foreground"
              )}
            >
              <FileText className="h-4 w-4" />
              Documents
            </button>

            {showDocs && (
              <div className="ml-6 space-y-1 border-l-2 border-border pl-3">
                {uploadedDocs.length === 0 ? (
                  <div className="rounded-lg px-3 py-2 text-xs leading-5 text-muted-foreground">
                    Uploaded docs will appear here after you attach a file and send a message.
                  </div>
                ) : (
                  uploadedDocs.map((doc) => {
                    const agent = AGENTS[doc.agentId];
                    return (
                      <button
                        key={`${doc.threadId}-${doc.id}`}
                        onClick={() => navigate({
                          to: "/chat/$agentId/$threadId",
                          params: { agentId: doc.agentId, threadId: doc.threadId },
                        })}
                        className="flex w-full min-w-0 items-start gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-secondary"
                      >
                        <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: agent.accentHex }} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-medium text-foreground">
                            {doc.name}
                          </span>
                          <span className="block truncate text-[11px] text-muted-foreground">
                            {formatSize(doc.size)} · {agent.short}
                          </span>
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
            
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
              <MessageCircle className="h-4 w-4" />
              Conversations
            </button>
            
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
            
            {showSettings && (
              <div className="ml-6 mt-1 space-y-1 border-l-2 border-border pl-3">
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Recent Conversations */}
          {order.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Recent
              </div>
              <div className="space-y-1">
                {order.slice(0, 5).map((id) => {
                  const t = threads[id];
                  if (!t) return null;
                  const agent = AGENTS[t.agentId];
                  const active = params.threadId === id;
                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <button
                        onClick={() => navigate({
                          to: "/chat/$agentId/$threadId",
                          params: { agentId: t.agentId, threadId: t.id },
                        })}
                        className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left"
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: agent.accentHex }} />
                        <span className="flex-1 truncate text-xs">{t.title}</span>
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          removeThread(id);
                        }}
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                        aria-label={`Delete ${t.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6 rounded-xl bg-primary/5 p-4">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-foreground">Need help choosing an agent?</div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Each agent is specialized for a specific task.
                </p>
                <button
                  onClick={goToAgentDetails}
                  className="mt-2 text-xs font-medium text-primary hover:underline"
                >
                  Learn more →
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      <div className="border-t border-border p-3">
        <div className={cn(
          "flex items-center gap-3 rounded-lg px-2 py-2",
          collapsed && "justify-center"
        )}>
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white">
            {userInitials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-sm font-medium">{user.name}</div>
              <div className="truncate text-xs text-muted-foreground">
                {user.email}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
