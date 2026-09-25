import { Module } from '@nestjs/common';
import { FlatsModule } from '../flats/flats.module';
import { MatchingModule } from '../matching/matching.module';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

@Module({
  imports: [MatchingModule, FlatsModule],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
