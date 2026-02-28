import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GuildModule } from './guild/guild.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
    GuildModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
