import {Controller, Get, Req, Res} from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { FileSystemService } from "./services";
import files from "./services/files";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly fs: FileSystemService) {}

  @Get()
  getData(@Req() request: Request, @Res() response: Response): void {
    if (!request.session.views) {
      request.session.views = 0;
    }

    request.session.views++;

    response.send({
      data: this.appService.getData(),
      views: request.session.views,
      about: files.regular.About
    });
  }
}
