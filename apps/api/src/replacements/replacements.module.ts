import { Module } from '@nestjs/common';
import { MatchingModule } from '../matching/matching.module';
import { ReplacementsController } from './replacements.controller';
import { ReplacementsService } from './replacements.service';

@Module({
  imports: [MatchingModule],
  controllers: [ReplacementsController],
  providers: [ReplacementsService],
})
export class ReplacementsModule {}
