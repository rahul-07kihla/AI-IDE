import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-canvas px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.35em] text-green-400">AI IDE</p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight">
            Build, edit, diff, run, and ship code with an agent-native workspace.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-400">
            This project scaffold includes the web app, API, Prisma data model, and sandbox worker needed for a Cursor-style SaaS IDE.
          </p>
          <div className="mt-10 flex gap-4">
            <Link href="/dashboard" className="rounded-lg bg-accent px-5 py-3 font-medium text-black">
              Open Dashboard
            </Link>
            <a href="http://localhost:4000/api/health" className="rounded-lg border border-border px-5 py-3 text-zinc-300">
              API Health
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

