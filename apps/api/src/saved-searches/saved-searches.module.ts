import { Module } from '@nestjs/common';
import { SavedSearchAlertsService } from './saved-search-alerts.service';
import { SavedSearchesController } from './saved-searches.controller';
import { SavedSearchesService } from './saved-searches.service';

@Module({
  controllers: [SavedSearchesController],
  providers: [SavedSearchesService, SavedSearchAlertsService],
  exports: [SavedSearchesService, SavedSearchAlertsService],
})
export class SavedSearchesModule {}
