import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateFileDto } from './dto/update-file.dto';

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(projectId: string) {
    return this.prisma.projectFile.findMany({
      where: { projectId },
      orderBy: [{ type: 'desc' }, { path: 'asc' }],
    });
  }

  async update(fileId: string, dto: UpdateFileDto) {
    const file = await this.prisma.projectFile.findUnique({ where: { id: fileId } });
    if (!file || file.type !== 'FILE') {
      throw new NotFoundException('File not found');
    }

    return this.prisma.projectFile.update({
      where: { id: fileId },
      data: {
        content: dto.content,
        sizeBytes: Buffer.byteLength(dto.content, 'utf8'),
      },
    });
  }
}

