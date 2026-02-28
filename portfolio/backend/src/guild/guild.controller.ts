import { Controller, Get, Post, Body } from '@nestjs/common';
import { GuildService } from './guild.service';

@Controller('guild')
export class GuildController {
  constructor(private readonly guildService: GuildService) {}

  @Get()
  async getLedger() {
    return await this.guildService.getEntries();
  }

  @Post('sign') // URL: /api/guild/sign
  async signLedger(@Body() visitorData: any) {
    return await this.guildService.addEntry(visitorData);
  }
}