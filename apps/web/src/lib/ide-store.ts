'use client';

import { create } from 'zustand';

type IdeFile = {
  id: string;
  path: string;
  name: string;
  language: 'typescript' | 'json' | 'markdown' | 'shell';
  content: string;
};

type AgentMessage = {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
};

type Diagnostic = {
  id: string;
  level: 'error' | 'warning' | 'info';
  filePath: string;
  message: string;
};

type TerminalEntry = {
  id: string;
  type: 'command' | 'output' | 'success' | 'error';
  text: string;
};

type ActivityView = 'explorer' | 'search' | 'git' | 'run' | 'agent';
type BottomPanelView = 'terminal' | 'problems' | 'output';
type AgentStatus = 'idle' | 'thinking';

type IdeState = {
  files: IdeFile[];
  openFileIds: string[];
  activeFileId: string;
  activeActivity: ActivityView;
  activeBottomPanel: BottomPanelView;
  sidebarCollapsed: boolean;
  assistantCollapsed: boolean;
  agentStatus: AgentStatus;
  prompt: string;
  command: string;
  terminalEntries: TerminalEntry[];
  diagnostics: Diagnostic[];
  agentMessages: AgentMessage[];
  hydrateAgentMessages: (projectId: string) => Promise<void>;
  openFile: (fileId: string) => void;
  closeFile: (fileId: string) => void;
  setActiveActivity: (value: ActivityView) => void;
  setActiveBottomPanel: (value: BottomPanelView) => void;
  toggleSidebar: () => void;
  toggleAssistant: () => void;
  setPrompt: (value: string) => void;
  setCommand: (value: string) => void;
  updateActiveFileContent: (value: string) => void;
  runCommand: () => void;
  runAgent: (projectId: string) => Promise<void>;
  saveActiveFile: () => void;
  clearTerminal: () => void;
};

const initialFiles: IdeFile[] = [
  {
    id: 'app-page',
    path: 'src/app/page.tsx',
    name: 'page.tsx',
    language: 'typescript',
    content: `export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto max-w-5xl px-6 py-24">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">AI IDE</p>
        <h1 className="mt-4 text-5xl font-semibold">Ship with agent-native tooling.</h1>
      </section>
    </main>
  );
}
`,
  },
  {
    id: 'workspace-shell',
    path: 'src/components/workspace-shell.tsx',
    name: 'workspace-shell.tsx',
    language: 'typescript',
    content: `type WorkspaceShellProps = {
  title: string;
};

export function WorkspaceShell({ title }: WorkspaceShellProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4">
      <h2 className="text-lg font-medium">{title}</h2>
    </div>
  );
}
`,
  },
  {
    id: 'package-json',
    path: 'package.json',
    name: 'package.json',
    language: 'json',
    content: `{
  "name": "ai-ide-platform",
  "private": true,
  "packageManager": "pnpm@9.15.0"
}
`,
  },
  {
    id: 'readme',
    path: 'README.md',
    name: 'README.md',
    language: 'markdown',
    content: `# AI IDE Platform

Installable browser IDE with file editing, agent chat, terminal actions, and sandbox-oriented architecture.
`,
  },
  {
    id: 'dev-script',
    path: 'scripts/dev.sh',
    name: 'dev.sh',
    language: 'shell',
    content: `#!/usr/bin/env bash
set -euo pipefail

pnpm install
pnpm dev
`,
  },
];

const initialDiagnostics: Diagnostic[] = [
  {
    id: 'diag-1',
    level: 'warning',
    filePath: 'src/app/page.tsx',
    message: 'Monaco integration is not installed yet. Using native editor surface.',
  },
  {
    id: 'diag-2',
    level: 'info',
    filePath: 'scripts/dev.sh',
    message: 'Sandbox worker endpoint is scaffolded and ready for Docker exec integration.',
  },
];

const initialTerminal: TerminalEntry[] = [
  { id: 'term-1', type: 'output', text: 'workspace booted: sample-project' },
  { id: 'term-2', type: 'output', text: 'services: web=ready api=scaffold sandbox=scaffold' },
];

const initialMessages: AgentMessage[] = [];

const legacyScaffoldMessages = new Set([
  'Context builder selected the active file, recent terminal output, and diagnostics.',
  'The local IDE shell is active. Next step is connecting this panel to the real NestJS agent execution endpoint.',
  'Agent pipeline scaffold is active. Connect this module to the model provider and tool executor to enable real code actions.',
]);

function createCommandResult(command: string): TerminalEntry[] {
  const trimmed = command.trim();
  if (!trimmed) {
    return [];
  }

  const commands = trimmed
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean);

  return commands.flatMap((singleCommand) => {
    if (singleCommand === 'pnpm dev') {
      return [
        { id: crypto.randomUUID(), type: 'command', text: '$ pnpm dev' },
        { id: crypto.randomUUID(), type: 'output', text: 'turbo run dev --parallel' },
        { id: crypto.randomUUID(), type: 'success', text: 'web listening on http://127.0.0.1:3001' },
      ];
    }

    if (singleCommand.includes('test')) {
      return [
        { id: crypto.randomUUID(), type: 'command', text: `$ ${singleCommand}` },
        { id: crypto.randomUUID(), type: 'output', text: 'running project test suite...' },
        { id: crypto.randomUUID(), type: 'success', text: '12 passed, 0 failed' },
      ];
    }

    if (singleCommand.includes('build')) {
      return [
        { id: crypto.randomUUID(), type: 'command', text: `$ ${singleCommand}` },
        { id: crypto.randomUUID(), type: 'output', text: 'building workspace packages...' },
        { id: crypto.randomUUID(), type: 'success', text: 'build completed without blocking errors' },
      ];
    }

    return [
      { id: crypto.randomUUID(), type: 'command', text: `$ ${singleCommand}` },
      { id: crypto.randomUUID(), type: 'output', text: 'sandbox hook accepted command for execution' },
      { id: crypto.randomUUID(), type: 'success', text: 'attach backend terminal gateway for live output' },
    ];
  });
}

export const useIdeStore = create<IdeState>((set, get) => ({
  files: initialFiles,
  openFileIds: ['app-page', 'workspace-shell'],
  activeFileId: 'app-page',
  activeActivity: 'explorer',
  activeBottomPanel: 'terminal',
  sidebarCollapsed: false,
  assistantCollapsed: false,
  agentStatus: 'idle',
  prompt: '',
  command: 'pnpm dev\npnpm --filter @ai-ide/web typecheck',
  terminalEntries: initialTerminal,
  diagnostics: initialDiagnostics,
  agentMessages: initialMessages,
  hydrateAgentMessages: async (projectId) => {
    try {
      const response = await fetch(`http://127.0.0.1:4000/api/chat/${projectId}`);
      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as Array<{
        id: string;
        role: 'USER' | 'ASSISTANT' | 'SYSTEM' | 'TOOL';
        content: string;
      }>;

      set({
        agentMessages: payload
          .filter((message) => !legacyScaffoldMessages.has(message.content))
          .map((message) => ({
            id: message.id,
            role:
              message.role === 'USER'
                ? 'user'
                : message.role === 'TOOL'
                  ? 'tool'
                  : 'assistant',
            content: message.content,
          })),
      });
    } catch {
      set({
        agentMessages: [
          {
            id: crypto.randomUUID(),
            role: 'tool',
            content: 'Could not load persisted assistant history from the API.',
          },
        ],
      });
    }
  },
  openFile: (fileId) =>
    set((state) => ({
      activeFileId: fileId,
      openFileIds: state.openFileIds.includes(fileId) ? state.openFileIds : [...state.openFileIds, fileId],
    })),
  closeFile: (fileId) =>
    set((state) => {
      const nextOpenFileIds = state.openFileIds.filter((id) => id !== fileId);
      const fallbackActiveId =
        state.activeFileId === fileId
          ? nextOpenFileIds[nextOpenFileIds.length - 1] ?? state.files[0]?.id ?? ''
          : state.activeFileId;

      return {
        openFileIds: nextOpenFileIds.length ? nextOpenFileIds : [state.files[0]?.id ?? ''],
        activeFileId: fallbackActiveId || state.files[0]?.id || '',
      };
    }),
  setActiveActivity: (value) => set({ activeActivity: value, sidebarCollapsed: false }),
  setActiveBottomPanel: (value) => set({ activeBottomPanel: value }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleAssistant: () => set((state) => ({ assistantCollapsed: !state.assistantCollapsed })),
  setPrompt: (value) => set({ prompt: value }),
  setCommand: (value) => set({ command: value }),
  updateActiveFileContent: (value) =>
    set((state) => ({
      files: state.files.map((file) => (file.id === state.activeFileId ? { ...file, content: value } : file)),
    })),
  saveActiveFile: () =>
    set((state) => ({
      terminalEntries: [
        ...state.terminalEntries,
        {
          id: crypto.randomUUID(),
          type: 'success',
          text: `saved ${state.files.find((file) => file.id === state.activeFileId)?.path ?? 'file'}`,
        },
      ],
    })),
  runCommand: () => {
    const command = get().command;
    set((state) => ({
      terminalEntries: [...state.terminalEntries, ...createCommandResult(command)],
      command: '',
      activeBottomPanel: 'terminal',
    }));
  },
  runAgent: async (projectId: string) => {
    const prompt = get().prompt.trim();
    if (!prompt) {
      return;
    }

    const activeFile = get().files.find((file) => file.id === get().activeFileId);
    set((state) => ({
      prompt: '',
      agentStatus: 'thinking',
      agentMessages: [
        ...state.agentMessages,
        { id: crypto.randomUUID(), role: 'user', content: prompt },
      ],
      terminalEntries: [
        ...state.terminalEntries,
        {
          id: crypto.randomUUID(),
          type: 'output',
          text: `agent run queued for ${activeFile?.path ?? 'workspace'}`,
        },
      ],
      activeActivity: 'agent',
      assistantCollapsed: false,
    }));

    try {
      const response = await fetch('http://127.0.0.1:4000/api/agents/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          content: prompt,
          activeFilePath: activeFile?.path,
          activeFileContent: activeFile?.content,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        set((state) => ({
          agentStatus: 'idle',
          agentMessages: [
            ...state.agentMessages,
            {
              id: crypto.randomUUID(),
              role: 'tool',
              content: `Assistant request failed: ${response.status} ${errorText}`,
            },
          ],
        }));
        return;
      }

      const payload = (await response.json()) as {
        runId?: string;
        status?: string;
        assistantMessage?: {
          content?: string;
        };
      };

      set((state) => ({
        agentStatus: 'idle',
        agentMessages: [
          ...state.agentMessages,
          {
            id: crypto.randomUUID(),
            role: 'tool',
            content: `Run ${payload.runId ?? 'unknown'} completed with status ${payload.status ?? 'unknown'}.`,
          },
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content:
              payload.assistantMessage?.content ??
              'The agent endpoint returned no assistant text.',
          },
        ],
      }));
    } catch (error) {
      set((state) => ({
        agentStatus: 'idle',
        agentMessages: [
          ...state.agentMessages,
          {
            id: crypto.randomUUID(),
            role: 'tool',
            content: `Assistant connection failed: ${error instanceof Error ? error.message : 'unknown error'}`,
          },
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'The backend agent call failed. Verify the API server is running and OPENAI_API_KEY is configured, then try again.',
          },
        ],
      }));
    }
  },
  clearTerminal: () => set({ terminalEntries: [] }),
}));
