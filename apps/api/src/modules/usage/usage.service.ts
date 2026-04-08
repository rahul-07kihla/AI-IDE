import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsageService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const totals = await this.prisma.usageLog.aggregate({
      _sum: {
        totalTokens: true,
        apiCostUsd: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      monthlyTokens: totals._sum.totalTokens ?? 0,
      monthlyRuns: totals._count.id,
      monthlyCostUsd: Number(totals._sum.apiCostUsd ?? 0),
    };
  }
}

