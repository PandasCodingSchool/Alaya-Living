import { Module } from '@nestjs/common';
import { SavedSearchesModule } from '../saved-searches/saved-searches.module';
import { FlatsController } from './flats.controller';
import { FlatsService } from './flats.service';

@Module({
  imports: [SavedSearchesModule],
  controllers: [FlatsController],
  providers: [FlatsService],
  exports: [FlatsService],
})
export class FlatsModule {}
