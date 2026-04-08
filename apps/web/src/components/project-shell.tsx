'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { InstallIdeButton } from './install-ide-button';
import { useIdeStore } from '../lib/ide-store';

type Props = {
  projectId: string;
};

function languageLabel(path: string) {
  if (path.endsWith('.tsx')) return 'TSX';
  if (path.endsWith('.json')) return 'JSON';
  if (path.endsWith('.md')) return 'MD';
  if (path.endsWith('.sh')) return 'SH';
  return 'TXT';
}

function shortName(path: string) {
  const parts = path.split('/');
  return parts[parts.length - 1] ?? path;
}

function directoryName(path: string) {
  const parts = path.split('/');
  return parts.length > 1 ? parts.slice(0, -1).join('/') : 'root';
}

function BottomTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`border-b-2 px-1 py-2 text-xs uppercase tracking-[0.18em] ${
        active ? 'border-sky-400 text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {label}
    </button>
  );
}

export function ProjectShell({ projectId }: Props) {
  const {
    files,
    openFileIds,
    activeFileId,
    activeBottomPanel,
    sidebarCollapsed,
    assistantCollapsed,
    agentStatus,
    prompt,
    command,
    terminalEntries,
    diagnostics,
    agentMessages,
    hydrateAgentMessages,
    openFile,
    closeFile,
    setActiveBottomPanel,
    toggleSidebar,
    toggleAssistant,
    setPrompt,
    setCommand,
    updateActiveFileContent,
    runCommand,
    runAgent,
    saveActiveFile,
    clearTerminal,
  } = useIdeStore();

  const activeFile = files.find((file) => file.id === activeFileId) ?? files[0];
  const openFiles = openFileIds.map((id) => files.find((file) => file.id === id)).filter(Boolean) as typeof files;
  const lines = activeFile.content.split('\n');
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const terminalRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    void hydrateAgentMessages(projectId);
  }, [hydrateAgentMessages, projectId]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isPrimary = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (event.altKey && key === '1') {
        event.preventDefault();
        toggleSidebar();
        return;
      }

      if (event.altKey && key === '2') {
        event.preventDefault();
        toggleAssistant();
        return;
      }

      if (event.altKey && key === '3') {
        event.preventDefault();
        setActiveBottomPanel('terminal');
        terminalRef.current?.focus();
        return;
      }

      if (event.altKey && key === '4') {
        event.preventDefault();
        promptRef.current?.focus();
        return;
      }

      if (!isPrimary) {
        return;
      }

      if (key === 's') {
        event.preventDefault();
        saveActiveFile();
        return;
      }

      if (event.key === 'Enter') {
        const target = event.target as HTMLElement | null;
        if (target === promptRef.current) {
          event.preventDefault();
          void runAgent(projectId);
          return;
        }

        if (target === terminalRef.current) {
          event.preventDefault();
          runCommand();
          return;
        }
      }
    }

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [projectId, runAgent, runCommand, saveActiveFile, setActiveBottomPanel, toggleAssistant, toggleSidebar]);

  return (
    <div className="flex min-h-screen flex-col bg-[#1e1e1e] text-zinc-100">
      <header className="flex h-12 items-center justify-between border-b border-[#2a2d2e] bg-[#181818] px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/dashboard" className="text-xs text-zinc-500 transition hover:text-white">
            Dashboard
          </Link>
          <div className="hidden h-4 w-px bg-[#2a2d2e] md:block" />
          <div className="truncate text-sm text-zinc-300">
            <span className="font-semibold text-zinc-100">Nova IDE</span>
            <span className="mx-2 text-zinc-600">|</span>
            <span>{projectId}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleSidebar} className="rounded border border-[#2a2d2e] bg-[#1e1e1e] px-2.5 py-1 text-xs text-zinc-300">
            {sidebarCollapsed ? 'Show Files' : 'Hide Files'}
          </button>
          <button onClick={toggleAssistant} className="rounded border border-[#2a2d2e] bg-[#1e1e1e] px-2.5 py-1 text-xs text-zinc-300">
            {assistantCollapsed ? 'Show AI' : 'Hide AI'}
          </button>
          <InstallIdeButton />
        </div>
      </header>

      <div
        className={`grid flex-1 ${
          sidebarCollapsed
            ? assistantCollapsed
              ? 'grid-cols-[minmax(0,1fr)]'
              : 'grid-cols-[minmax(0,1fr)_360px]'
            : assistantCollapsed
              ? 'grid-cols-[280px_minmax(0,1fr)]'
              : 'grid-cols-[280px_minmax(0,1fr)_360px]'
        }`}
      >
        {!sidebarCollapsed && (
          <aside className="flex min-h-0 flex-col border-r border-[#2a2d2e] bg-[#181818]">
            <div className="flex h-11 items-center justify-between border-b border-[#2a2d2e] px-4">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">Explorer</div>
              <div className="text-xs text-zinc-500">{files.length} files</div>
            </div>

            <div className="flex-1 overflow-auto px-2 py-3">
              <div className="mb-3 px-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">Open Editors</div>
              <div className="space-y-1">
                {openFiles.map((file) => (
                  <div
                    key={`open-${file.id}`}
                    className={`flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${
                      file.id === activeFileId ? 'bg-[#2a2d2e] text-white' : 'text-zinc-400 hover:bg-[#252526]'
                    }`}
                  >
                    <button onClick={() => openFile(file.id)} className="min-w-0 flex-1 text-left">
                      <span className="mr-2 text-[10px] uppercase text-zinc-500">{languageLabel(file.path)}</span>
                      <span className="truncate">{shortName(file.path)}</span>
                    </button>
                    <button onClick={() => closeFile(file.id)} className="text-zinc-500 hover:text-white">
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-5 px-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">Files</div>
              <div className="mt-2 space-y-1">
                {files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => openFile(file.id)}
                    className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm ${
                      file.id === activeFileId ? 'bg-[#2a2d2e] text-white' : 'text-zinc-400 hover:bg-[#252526] hover:text-zinc-100'
                    }`}
                  >
                    <span className="w-4 text-center text-[10px] uppercase text-zinc-500">{languageLabel(file.path).slice(0, 1)}</span>
                    <div className="min-w-0">
                      <div className="truncate">{shortName(file.path)}</div>
                      <div className="truncate text-[11px] text-zinc-500">{directoryName(file.path)}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-5 px-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">Problems</div>
              <div className="mt-2 space-y-2">
                {diagnostics.map((item) => (
                  <div key={item.id} className="rounded-sm border border-[#2a2d2e] bg-[#141414] px-3 py-2 text-xs text-zinc-400">
                    <div className="font-medium text-zinc-200">{shortName(item.filePath)}</div>
                    <div className="mt-1 leading-5">{item.message}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}

        <section className="grid min-h-0 grid-rows-[minmax(0,1fr)_240px_24px]">
          <div className="grid min-h-0 grid-rows-[35px_minmax(0,1fr)]">
            <div className="flex items-center overflow-x-auto border-b border-[#2a2d2e] bg-[#181818]">
              {openFiles.map((file) => {
                const active = file.id === activeFileId;
                return (
                  <div
                    key={file.id}
                    className={`flex h-full min-w-[180px] items-center gap-2 border-r border-[#2a2d2e] px-3 text-sm ${
                      active ? 'bg-[#1e1e1e] text-white' : 'bg-[#181818] text-zinc-500 hover:text-zinc-200'
                    }`}
                  >
                    <button onClick={() => openFile(file.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                      <span className="text-[10px] uppercase text-zinc-500">{languageLabel(file.path)}</span>
                      <span className="truncate">{shortName(file.path)}</span>
                    </button>
                    <button onClick={() => closeFile(file.id)} className="text-zinc-500 hover:text-white">
                      ×
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="grid min-h-0 grid-cols-[52px_minmax(0,1fr)_96px] bg-[#1e1e1e]">
              <div className="overflow-hidden border-r border-[#2a2d2e] bg-[#1e1e1e] px-3 py-3 text-right font-mono text-xs leading-6 text-zinc-600">
                {lines.map((_, index) => (
                  <div key={`${activeFile.id}-${index + 1}`}>{index + 1}</div>
                ))}
              </div>

              <div className="grid min-h-0 grid-rows-[34px_minmax(0,1fr)]">
                <div className="flex items-center justify-between border-b border-[#2a2d2e] bg-[#1e1e1e] px-4 text-xs text-zinc-500">
                  <div className="truncate">{activeFile.path}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={saveActiveFile} className="rounded-sm bg-[#2a2d2e] px-2 py-1 text-zinc-300 hover:bg-[#343436]">
                      Save
                    </button>
                    <button className="rounded-sm bg-sky-500/20 px-2 py-1 text-sky-200 hover:bg-sky-500/30">Patch</button>
                  </div>
                </div>

                <textarea
                  spellCheck={false}
                  value={activeFile.content}
                  onChange={(event) => updateActiveFileContent(event.target.value)}
                  className="h-full w-full resize-none bg-[#1e1e1e] px-4 py-3 font-mono text-[13px] leading-6 text-zinc-200 outline-none"
                />
              </div>

              <div className="border-l border-[#2a2d2e] bg-[#252526] px-2 py-3">
                {Array.from({ length: 28 }).map((_, index) => (
                  <div key={`mini-${index}`} className="mb-1 h-1 rounded-sm bg-zinc-500/30" />
                ))}
              </div>
            </div>
          </div>

          <section className="border-t border-[#2a2d2e] bg-[#181818]">
            <div className="min-h-0">
              <div className="flex h-10 items-center justify-between border-b border-[#2a2d2e] px-4">
                <div className="flex items-center gap-4">
                  <BottomTab label="Terminal" active={activeBottomPanel === 'terminal'} onClick={() => setActiveBottomPanel('terminal')} />
                  <BottomTab label="Problems" active={activeBottomPanel === 'problems'} onClick={() => setActiveBottomPanel('problems')} />
                  <BottomTab label="Output" active={activeBottomPanel === 'output'} onClick={() => setActiveBottomPanel('output')} />
                </div>
                <button onClick={clearTerminal} className="text-xs text-zinc-500 hover:text-zinc-200">
                  Clear
                </button>
              </div>

              <div className="p-4">
                {activeBottomPanel === 'terminal' && (
                  <>
                    <div className="mb-3 h-24 overflow-auto rounded-sm border border-[#2a2d2e] bg-[#141414] p-3 font-mono text-xs leading-6 text-zinc-300">
                      {terminalEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className={
                            entry.type === 'error'
                              ? 'text-rose-300'
                              : entry.type === 'success'
                                ? 'text-emerald-300'
                                : entry.type === 'command'
                                  ? 'text-sky-300'
                                  : 'text-zinc-300'
                          }
                        >
                          {entry.text}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <textarea
                        ref={terminalRef}
                        value={command}
                        onChange={(event) => setCommand(event.target.value)}
                        className="h-20 w-full resize-none rounded-sm border border-[#2a2d2e] bg-[#1e1e1e] px-3 py-2 font-mono text-sm text-zinc-200 outline-none"
                        placeholder={'pnpm dev\npnpm --filter @ai-ide/web typecheck'}
                      />
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-zinc-500">Run multiple commands, one per line.</div>
                        <button onClick={runCommand} className="rounded bg-[#2a2d2e] px-4 py-2 text-sm text-zinc-200 hover:bg-[#343436]">
                          Run
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {activeBottomPanel === 'problems' && (
                  <div className="space-y-2">
                    {diagnostics.map((item) => (
                      <div key={item.id} className="rounded-sm border border-[#2a2d2e] bg-[#141414] px-3 py-2 text-sm text-zinc-300">
                        <div className="font-medium">{item.filePath}</div>
                        <div className="mt-1 text-zinc-500">{item.message}</div>
                      </div>
                    ))}
                  </div>
                )}

                {activeBottomPanel === 'output' && (
                  <div className="rounded-sm border border-[#2a2d2e] bg-[#141414] p-3 text-sm text-zinc-400">
                    Build and agent output streams can be shown here when the backend gateways are connected.
                  </div>
                )}
              </div>
            </div>
          </section>

          <footer className="flex items-center justify-between bg-[#007acc] px-3 text-xs text-white">
            <div className="flex items-center gap-4">
              <span>main</span>
              <span>TypeScript</span>
              <span>UTF-8</span>
              <span>LF</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Files Left</span>
              <span>AI Right</span>
              <span>127.0.0.1:3001</span>
            </div>
          </footer>
        </section>

        {!assistantCollapsed && (
          <aside className="flex min-h-0 flex-col border-l border-[#2a2d2e] bg-[#181818]">
            <div className="flex h-11 items-center justify-between border-b border-[#2a2d2e] px-4">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">AI Assistant</div>
              <div className="text-xs text-zinc-500">{agentStatus === 'thinking' ? 'Thinking...' : 'Ready'}</div>
            </div>

            <div className="border-b border-[#2a2d2e] px-4 py-3">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-zinc-100">Nova Agent</div>
                  <div className="text-xs text-zinc-500">Code, patches, terminal plans</div>
                </div>
                <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-emerald-300">
                  online
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {['Explain file', 'Create patch', 'Run tests', 'Desktop build'].map((label) => (
                  <button
                    key={label}
                    onClick={() => setPrompt(label)}
                    className="rounded-sm border border-[#2a2d2e] bg-[#1f1f1f] px-2.5 py-2 text-left text-xs text-zinc-300 hover:bg-[#282828]"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-b border-[#2a2d2e] bg-[#141414] px-3 py-2 text-[11px] text-zinc-500">
              Shortcuts: Alt+1 files, Alt+2 AI, Alt+3 terminal, Alt+4 AI prompt, Ctrl/Cmd+S save.
            </div>

            <div className="flex-1 overflow-auto px-3 py-3">
              {agentMessages.length === 0 ? (
                <div className="rounded-sm border border-[#2a2d2e] bg-[#141414] px-3 py-4 text-sm text-zinc-400">
                  No conversation yet. Open a file and ask the agent for a concrete coding task.
                </div>
              ) : (
                agentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-2 rounded-sm border px-3 py-2 text-sm leading-6 ${
                      message.role === 'assistant'
                        ? 'border-[#2a2d2e] bg-[#1f1f1f] text-zinc-100'
                        : message.role === 'tool'
                          ? 'border-[#2a3a2f] bg-[#13261c] text-emerald-100'
                          : 'border-[#2a2d2e] bg-[#111827] text-sky-100'
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      <span>{message.role}</span>
                      <span>{message.role === 'assistant' ? 'AI' : message.role === 'tool' ? 'Tool' : 'You'}</span>
                    </div>
                    <div>{message.content}</div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-[#2a2d2e] bg-[#181818] p-3">
              <textarea
                ref={promptRef}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                className="h-24 w-full resize-none rounded-sm border border-[#2a2d2e] bg-[#1e1e1e] px-3 py-2 text-sm text-zinc-200 outline-none"
                placeholder="Ask the agent to edit files, create a patch, or run tests"
              />
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-zinc-500">Ctrl/Cmd+Enter sends</div>
                <button onClick={() => void runAgent(projectId)} className="rounded bg-sky-500 px-4 py-2 text-sm font-semibold text-black">
                  Send
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
