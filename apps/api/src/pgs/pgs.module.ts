import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { PgsController } from './pgs.controller';
import { PgsService } from './pgs.service';

@Module({
  imports: [UsersModule, AuthModule],
  controllers: [PgsController],
  providers: [PgsService],
})
export class PgsModule {}
