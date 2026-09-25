import { Module } from '@nestjs/common';
import { MatchingModule } from '../matching/matching.module';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

@Module({
  imports: [MatchingModule],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
