import { IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  projectId!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  activeFilePath?: string;

  @IsOptional()
  @IsString()
  activeFileContent?: string;
}
