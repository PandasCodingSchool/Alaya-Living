import { Body, Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsString, MinLength } from 'class-validator';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

class SendMessageDto {
  @IsString()
  @MinLength(1)
  body!: string;
}

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chat: ChatService,
    private readonly gateway: ChatGateway,
  ) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.chat.list(user.id);
  }

  @Get(':id/messages')
  messages(@CurrentUser() user: User, @Param('id') id: string) {
    return this.chat.messages(user.id, id);
  }

  @Post(':id/messages')
  async send(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: SendMessageDto) {
    const { message, otherUserId } = await this.chat.send(user.id, id, dto.body);
    this.gateway.emitToConversation(id, 'message', message);
    this.gateway.emitToUser(otherUserId, 'inbox', { conversationId: id, message });
    return message;
  }

  @Post(':id/messages/image')
  @UseInterceptors(FileInterceptor('file'))
  async sendImage(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('caption') caption?: string,
  ) {
    const { message, otherUserId } = await this.chat.sendImage(user.id, id, file, caption);
    this.gateway.emitToConversation(id, 'message', message);
    this.gateway.emitToUser(otherUserId, 'inbox', { conversationId: id, message });
    return message;
  }
}
