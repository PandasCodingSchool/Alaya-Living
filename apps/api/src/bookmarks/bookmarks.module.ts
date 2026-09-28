import { Module } from '@nestjs/common';
import { FlatsModule } from '../flats/flats.module';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';

@Module({
  imports: [FlatsModule],
  controllers: [BookmarksController],
  providers: [BookmarksService],
})
export class BookmarksModule {}
