import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { ExecuteAgentDto } from './dto/execute-agent.dto';

@Injectable()
export class AgentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async execute(dto: ExecuteAgentDto) {
    const run = await this.prisma.agentRun.create({
      data: {
        objective: dto.prompt,
        projectId: dto.projectId,
        user: {
          connectOrCreate: {
            where: { email: 'owner@example.com' },
            create: {
              email: 'owner@example.com',
              passwordHash: 'seed-password',
              name: 'Default Owner',
            },
          },
        },
        status: 'QUEUED',
        planJson: {
          steps: [
            'Build context',
            'Call model',
            'Resolve tools',
            'Prepare patch',
          ],
        },
      },
    });

    await this.prisma.message.create({
      data: {
        projectId: dto.projectId,
        role: 'USER',
        content: dto.prompt,
      },
    });

    const assistantContent = await this.generateAgentReply(dto);

    const assistantMessage = await this.prisma.message.create({
      data: {
        projectId: dto.projectId,
        role: 'ASSISTANT',
        content: assistantContent,
      },
    });

    const completedRun = await this.prisma.agentRun.update({
      where: { id: run.id },
      data: {
        status: 'COMPLETED',
        startedAt: new Date(),
        completedAt: new Date(),
        toolTraceJson: {
          context: {
            activeFilePath: dto.activeFilePath ?? null,
          },
          provider: 'openai-responses',
        },
      },
    });

    return {
      runId: completedRun.id,
      status: completedRun.status,
      assistantMessage,
      plan: completedRun.planJson,
    };
  }

  private async generateAgentReply(dto: ExecuteAgentDto) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    const model = this.config.get<string>('OPENAI_MODEL', 'gpt-5.2');

    if (!apiKey) {
      return 'OpenAI is not configured. Add OPENAI_API_KEY to .env and restart the API to enable the real agent endpoint.';
    }

    const systemPrompt = [
      'You are a coding agent inside a VS Code-like IDE.',
      'Be concise, practical, and technically specific.',
      'Prefer actionable edits, debugging steps, and implementation guidance.',
      'If the request is ambiguous, make the smallest safe assumption and state it briefly.',
    ].join(' ');

    const userPrompt = [
      `User request: ${dto.prompt}`,
      dto.activeFilePath ? `Active file: ${dto.activeFilePath}` : null,
      dto.activeFileContent ? `Active file content:\n${dto.activeFileContent}` : null,
    ]
      .filter(Boolean)
      .join('\n\n');

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        reasoning: {
          effort: 'medium',
        },
        input: [
          {
            role: 'system',
            content: [{ type: 'input_text', text: systemPrompt }],
          },
          {
            role: 'user',
            content: [{ type: 'input_text', text: userPrompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return `Agent request failed: ${response.status} ${errorBody}`;
    }

    const payload = (await response.json()) as {
      output_text?: string;
      output?: Array<{
        content?: Array<{
          type?: string;
          text?: string;
        }>;
      }>;
    };

    if (payload.output_text?.trim()) {
      return payload.output_text.trim();
    }

    const text = payload.output
      ?.flatMap((item) => item.content ?? [])
      .filter((item) => item.type === 'output_text' || item.type === 'text')
      .map((item) => item.text ?? '')
      .join('\n')
      .trim();

    return text || 'No agent output returned from OpenAI.';
  }
}
