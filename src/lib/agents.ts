import {
  BookOpenText,
  Activity,
  Code2,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type AgentId = "knowledge" | "rca" | "codegen" | "autofix";

export interface AgentDef {
  id: AgentId;
  name: string;
  short: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  accentVar: string;
  accentHex: string;
  suggestions: string[];
}

export const AGENTS: Record<AgentId, AgentDef> = {
  knowledge: {
    id: "knowledge",
    name: "Knowledge Assistant",
    short: "Knowledge",
    tagline: "Retrieval-grounded answers from your enterprise corpus",
    description:
      "Ask questions against uploaded PDFs, docs and wikis. Returns cited, summarized answers with confidence scoring.",
    icon: BookOpenText,
    accentVar: "var(--agent-knowledge)",
    accentHex: "#5DD4D0",
    suggestions: [
      "Summarize the Q3 architecture review document",
      "What is our incident escalation policy?",
      "Compare the v1 and v2 onboarding flows",
      "Find every mention of SLA in uploaded docs",
    ],
  },
  rca: {
    id: "rca",
    name: "Root Cause Analysis",
    short: "RCA",
    tagline: "Trace incidents to their probable origin",
    description:
      "Paste logs or upload a trace. The agent clusters errors, builds a dependency graph and ranks probable root causes.",
    icon: Activity,
    accentVar: "var(--agent-rca)",
    accentHex: "#F4B860",
    suggestions: [
      "Analyze this 500 spike from auth-service",
      "Why is checkout latency rising since 14:00 UTC?",
      "Cluster these errors and rank likely causes",
      "Build a dependency graph from this trace",
    ],
  },
  codegen: {
    id: "codegen",
    name: "Code Generator",
    short: "CodeGen",
    tagline: "Production-ready code from intent",
    description:
      "Generate full modules, endpoints, schemas and tests across React, Python, Java, Node, SQL and more.",
    icon: Code2,
    accentVar: "var(--agent-codegen)",
    accentHex: "#7AE2B8",
    suggestions: [
      "Build a REST API for inventory in FastAPI",
      "Generate a React table with sorting + pagination",
      "Create SQL migration for a multi-tenant orders table",
      "Scaffold a Node.js auth microservice",
    ],
  },
  autofix: {
    id: "autofix",
    name: "Auto Code Fixer",
    short: "AutoFix",
    tagline: "Find, explain and patch bugs automatically",
    description:
      "Paste broken code. The agent diagnoses the issue, returns a unified diff, and explains the reasoning.",
    icon: Wrench,
    accentVar: "var(--agent-autofix)",
    accentHex: "#E68DD4",
    suggestions: [
      "Fix this race condition in my async handler",
      "Why does this React component re-render infinitely?",
      "Patch this SQL query — it returns duplicates",
      "Repair this failing TypeScript build",
    ],
  },
};

export const AGENT_LIST: AgentDef[] = [
  AGENTS.knowledge,
  AGENTS.rca,
  AGENTS.codegen,
  AGENTS.autofix,
];