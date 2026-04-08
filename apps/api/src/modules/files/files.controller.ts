import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { FilesService } from './files.service';
import { UpdateFileDto } from './dto/update-file.dto';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('project/:projectId')
  list(@Param('projectId') projectId: string) {
    return this.filesService.list(projectId);
  }

  @Patch(':fileId')
  update(@Param('fileId') fileId: string, @Body() dto: UpdateFileDto) {
    return this.filesService.update(fileId, dto);
  }
}

