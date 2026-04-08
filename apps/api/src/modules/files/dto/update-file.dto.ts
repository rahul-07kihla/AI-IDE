import { IsString } from 'class-validator';

export class UpdateFileDto {
  @IsString()
  content!: string;
}

