import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async list(projectId: string) {
    return this.prisma.message.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(dto: CreateMessageDto) {
    const userMessage = await this.prisma.message.create({
      data: {
        projectId: dto.projectId,
        role: 'USER',
        content: dto.content,
      },
    });

    const assistantContent = await this.generateAssistantReply(dto);

    const assistantMessage = await this.prisma.message.create({
      data: {
        projectId: dto.projectId,
        role: 'ASSISTANT',
        content: assistantContent,
      },
    });

    return { userMessage, assistantMessage };
  }

  private async generateAssistantReply(dto: CreateMessageDto) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    const model = this.config.get<string>('OPENAI_MODEL', 'gpt-5.2');

    if (!apiKey) {
      return 'OpenAI is not configured. Add OPENAI_API_KEY to .env to use a real GPT-backed assistant.';
    }

    const systemPrompt = [
      'You are an AI coding assistant inside a VS Code-like IDE.',
      'Be concise and practical.',
      'When useful, give short step-by-step coding guidance.',
      'Focus on the current file and task context.',
    ].join(' ');

    const userPrompt = [
      `User request: ${dto.content}`,
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
      return `OpenAI request failed: ${response.status} ${errorBody}`;
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

    return text || 'No assistant output returned from OpenAI.';
  }
}
