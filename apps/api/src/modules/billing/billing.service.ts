import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async plans() {
    return {
      plans: [
        {
          key: 'FREE',
          priceMonthlyUsd: 0,
          limits: {
            monthlyTokens: 100000,
            monthlyAgentRuns: 25,
          },
        },
        {
          key: 'PRO',
          priceMonthlyUsd: 20,
          limits: {
            monthlyTokens: 5000000,
            monthlyAgentRuns: 500,
          },
        },
      ],
    };
  }

  async subscriptions() {
    return this.prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}

