import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './modules/health/health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { FilesModule } from './modules/files/files.module';
import { ChatModule } from './modules/chat/chat.module';
import { AgentsModule } from './modules/agents/agents.module';
import { UsageModule } from './modules/usage/usage.module';
import { BillingModule } from './modules/billing/billing.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProjectsModule,
    FilesModule,
    ChatModule,
    AgentsModule,
    UsageModule,
    BillingModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

