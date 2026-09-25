import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgreementsModule } from './agreements/agreements.module';
import { AuthModule } from './auth/auth.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { FlatsModule } from './flats/flats.module';
import { GroupsModule } from './groups/groups.module';
import { PgsModule } from './pgs/pgs.module';
import { ReplacementsModule } from './replacements/replacements.module';
import { ChatModule } from './chat/chat.module';
import { InterestsModule } from './interests/interests.module';
import { MatchingModule } from './matching/matching.module';
import { MembershipModule } from './membership/membership.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { RoomsModule } from './rooms/rooms.module';
import { HealthController } from './health.controller';
import { SafetyModule } from './safety/safety.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    StorageModule,
    AuthModule,
    UsersModule,
    RoomsModule,
    MatchingModule,
    InterestsModule,
    BookmarksModule,
    AgreementsModule,
    ReplacementsModule,
    GroupsModule,
    FlatsModule,
    PgsModule,
    MembershipModule,
    ChatModule,
    SafetyModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
