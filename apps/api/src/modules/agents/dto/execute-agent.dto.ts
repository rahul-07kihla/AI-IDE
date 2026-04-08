import { IsOptional, IsString } from 'class-validator';

export class ExecuteAgentDto {
  @IsString()
  projectId!: string;

  @IsString()
  prompt!: string;

  @IsOptional()
  @IsString()
  activeFilePath?: string;

  @IsOptional()
  @IsString()
  activeFileContent?: string;
}
