import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {FileSystemService} from "./services";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, FileSystemService],
})
export class AppModule {}
