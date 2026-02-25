import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GuildModule } from './guild/guild.module';

@Module({
  imports: [GuildModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
