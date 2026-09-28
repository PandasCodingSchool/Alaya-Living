import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SavedSearchesModule } from '../saved-searches/saved-searches.module';
import { UsersModule } from '../users/users.module';
import { PgsController } from './pgs.controller';
import { PgsService } from './pgs.service';

@Module({
  imports: [UsersModule, AuthModule, SavedSearchesModule],
  controllers: [PgsController],
  providers: [PgsService],
})
export class PgsModule {}
