import { Module } from '@nestjs/common';
import { SavedSearchesModule } from '../saved-searches/saved-searches.module';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';

@Module({
  imports: [SavedSearchesModule],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
