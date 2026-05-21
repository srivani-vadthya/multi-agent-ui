import { create } from "zustand";
import type { AgentId } from "./agents";

export type Role = "user" | "assistant";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  streaming?: boolean;
  files?: UploadedFile[];
  /** Agent-specific structured side-data rendered in the right panel */
  meta?: Record<string, unknown>;
}

export interface Thread {
  id: string;
  agentId: AgentId;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  files: UploadedFile[];
}

interface State {
  threads: Record<string, Thread>;
  order: string[]; // thread id order, newest first
  createThread: (agentId: AgentId) => Thread;
  getThread: (id: string) => Thread | undefined;
  deleteThread: (id: string) => void;
  setTitle: (id: string, title: string) => void;
  addMessage: (threadId: string, m: Message) => void;
  updateMessage: (threadId: string, id: string, patch: Partial<Message>) => void;
  appendToMessage: (threadId: string, id: string, chunk: string) => void;
  addFiles: (threadId: string, files: UploadedFile[]) => void;
}

const uid = () =>
  Math.random().toString(36).slice(2, 10) +
  Date.now().toString(36).slice(-4);

export const useChatStore = create<State>((set, get) => ({
  threads: {},
  order: [],
  createThread: (agentId) => {
    const id = uid();
    const now = Date.now();
    const thread: Thread = {
      id,
      agentId,
      title: "New conversation",
      createdAt: now,
      updatedAt: now,
      messages: [],
      files: [],
    };
    set((s) => ({
      threads: { ...s.threads, [id]: thread },
      order: [id, ...s.order],
    }));
    return thread;
  },
  getThread: (id) => get().threads[id],
  deleteThread: (id) =>
    set((s) => {
      const { [id]: _, ...rest } = s.threads;
      return { threads: rest, order: s.order.filter((x) => x !== id) };
    }),
  setTitle: (id, title) =>
    set((s) => {
      const t = s.threads[id];
      if (!t) return s;
      return { threads: { ...s.threads, [id]: { ...t, title } } };
    }),
  addMessage: (threadId, m) =>
    set((s) => {
      const t = s.threads[threadId];
      if (!t) return s;
      return {
        threads: {
          ...s.threads,
          [threadId]: {
            ...t,
            messages: [...t.messages, m],
            updatedAt: Date.now(),
          },
        },
      };
    }),
  updateMessage: (threadId, id, patch) =>
    set((s) => {
      const t = s.threads[threadId];
      if (!t) return s;
      return {
        threads: {
          ...s.threads,
          [threadId]: {
            ...t,
            messages: t.messages.map((m) =>
              m.id === id ? { ...m, ...patch } : m
            ),
          },
        },
      };
    }),
  appendToMessage: (threadId, id, chunk) =>
    set((s) => {
      const t = s.threads[threadId];
      if (!t) return s;
      return {
        threads: {
          ...s.threads,
          [threadId]: {
            ...t,
            messages: t.messages.map((m) =>
              m.id === id ? { ...m, content: m.content + chunk } : m
            ),
          },
        },
      };
    }),
  addFiles: (threadId, files) =>
    set((s) => {
      const t = s.threads[threadId];
      if (!t) return s;
      return {
        threads: {
          ...s.threads,
          [threadId]: { ...t, files: [...t.files, ...files] },
        },
      };
    }),
}));

export const newMessage = (
  role: Role,
  content = "",
  extra: Partial<Message> = {}
): Message => ({
  id: uid(),
  role,
  content,
  createdAt: Date.now(),
  ...extra,
});