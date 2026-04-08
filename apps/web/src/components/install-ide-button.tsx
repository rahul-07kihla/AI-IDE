'use client';

import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export function InstallIdeButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  if (installed) {
    return <span className="rounded-full border border-emerald-500/40 px-3 py-1 text-xs text-emerald-300">Installed</span>;
  }

  if (!deferredPrompt) {
    return <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">Install Ready</span>;
  }

  return (
    <button
      onClick={handleInstall}
      className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-black transition hover:bg-emerald-400"
    >
      Install App
    </button>
  );
}

