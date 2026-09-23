import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { StorageService } from './storage.service';

@Controller('files')
export class FilesController {
  constructor(private readonly storage: StorageService) {}

  @Get(':folder/:name')
  async get(@Param('folder') folder: string, @Param('name') name: string, @Res() res: Response) {
    if (!['rooms', 'profiles'].includes(folder) || name.includes('..') || name.includes('/') || name.includes('\\')) {
      throw new NotFoundException();
    }
    const file = await this.storage.getObject(`${folder}/${name}`);
    if (!file) throw new NotFoundException();
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    file.body.pipe(res);
  }
}
