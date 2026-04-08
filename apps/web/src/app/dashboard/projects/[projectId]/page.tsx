import { ProjectShell } from '../../../../components/project-shell';

export function generateStaticParams() {
  return [{ projectId: 'sample-project' }];
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectShell projectId={projectId} />;
}
