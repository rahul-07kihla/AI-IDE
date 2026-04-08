import Link from 'next/link';

const projects = [
  {
    id: 'sample-project',
    name: 'Sample AI IDE Workspace',
    description: 'Frontend, backend, sandbox, and billing scaffold',
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-canvas px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-green-400">Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold">Projects</h1>
          </div>
          <button className="rounded-lg bg-accent px-4 py-2 font-medium text-black">New Project</button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="rounded-2xl border border-border bg-panel p-6 transition hover:border-green-500"
            >
              <h2 className="text-xl font-semibold">{project.name}</h2>
              <p className="mt-2 text-zinc-400">{project.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

