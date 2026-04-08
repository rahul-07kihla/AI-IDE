import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        updatedAt: true,
      },
    });
  }

  async create(dto: CreateProjectDto) {
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return this.prisma.project.create({
      data: {
        owner: {
          connectOrCreate: {
            where: { email: 'owner@example.com' },
            create: {
              email: 'owner@example.com',
              passwordHash: 'seed-password',
              name: 'Default Owner',
            },
          },
        },
        name: dto.name,
        slug: `${slug}-${Date.now()}`,
        description: dto.description,
        rootPath: `/workspace/${slug}`,
        files: {
          create: [
            {
              path: '/',
              name: '/',
              type: 'DIRECTORY',
            },
            {
              path: '/README.md',
              name: 'README.md',
              type: 'FILE',
              extension: 'md',
              content: `# ${dto.name}\n`,
              sizeBytes: dto.name.length + 3,
            },
          ],
        },
      },
    });
  }
}

