import { Controller, Get } from '@nestjs/common';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('plans')
  plans() {
    return this.billingService.plans();
  }

  @Get('subscriptions')
  subscriptions() {
    return this.billingService.subscriptions();
  }
}

