import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':projectId')
  list(@Param('projectId') projectId: string) {
    return this.chatService.list(projectId);
  }

  @Post()
  create(@Body() dto: CreateMessageDto) {
    return this.chatService.create(dto);
  }
}

