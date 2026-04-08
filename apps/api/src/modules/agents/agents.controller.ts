import { Body, Controller, Post } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { ExecuteAgentDto } from './dto/execute-agent.dto';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post('execute')
  execute(@Body() dto: ExecuteAgentDto) {
    return this.agentsService.execute(dto);
  }
}

