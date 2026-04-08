export type PlanKey = 'FREE' | 'PRO';

export interface ProjectSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  updatedAt: string;
}

export interface FileNode {
  id: string;
  path: string;
  name: string;
  type: 'FILE' | 'DIRECTORY';
  content?: string | null;
}

export interface ChatMessageDto {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM' | 'TOOL';
  content: string;
  createdAt: string;
}

export interface UsageSummary {
  monthlyTokens: number;
  monthlyRuns: number;
  monthlyCostUsd: number;
}

export interface AgentExecutionRequest {
  projectId: string;
  prompt: string;
}

export interface AgentExecutionResponse {
  runId: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
}

