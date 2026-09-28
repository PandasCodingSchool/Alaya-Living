import { Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.notifications.list(user.id);
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser() user: User) {
    const count = await this.notifications.unreadCount(user.id);
    return { count };
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user: User, @Param('id') id: string) {
    return this.notifications.markRead(user.id, id);
  }

  @Post('read-all')
  markAllRead(@CurrentUser() user: User) {
    return this.notifications.markAllRead(user.id);
  }
}
