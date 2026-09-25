import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { MessageType } from '@prisma/client';
import { publicMediaUrl } from '../lib/media-url';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { toPublicProfile, userInclude } from '../users/user.mapper';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async list(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      include: {
        userA: { include: userInclude },
        userB: { include: userInclude },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        match: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return conversations.map((c) => {
      const other = c.userAId === userId ? c.userB : c.userA;
      return {
        id: c.id,
        matchId: c.matchId,
        status: c.match.status,
        other: toPublicProfile(other),
        lastMessage: c.messages[0] ? this.toPublicMessage(c.messages[0]) : null,
      };
    });
  }

  async messages(userId: string, conversationId: string) {
    const conversation = await this.requireParticipant(userId, conversationId);
    const messages = await this.prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
    });
    return messages.map((message) => this.toPublicMessage(message));
  }

  async send(userId: string, conversationId: string, body: string) {
    const text = body.trim();
    if (!text) throw new BadRequestException('Message body required');
    return this.createMessage(userId, conversationId, { type: 'TEXT', body: text });
  }

  async sendImage(userId: string, conversationId: string, file: Express.Multer.File, caption?: string) {
    if (!file?.mimetype?.startsWith('image/')) throw new BadRequestException('Image file required');
    const url = await this.storage.upload(file, 'chat');
    return this.createMessage(userId, conversationId, {
      type: 'IMAGE',
      body: caption?.trim() || '',
      imageUrl: url,
    });
  }

  private async createMessage(
    userId: string,
    conversationId: string,
    data: { type: MessageType; body: string; imageUrl?: string },
  ) {
    const conversation = await this.requireParticipant(userId, conversationId);
    const blocked = await this.prisma.block.findFirst({
      where: {
        OR: [
          { fromUserId: userId, toUserId: conversation.userAId === userId ? conversation.userBId : conversation.userAId },
          { toUserId: userId, fromUserId: conversation.userAId === userId ? conversation.userBId : conversation.userAId },
        ],
      },
    });
    if (blocked) throw new ForbiddenException('Conversation is blocked');

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        type: data.type,
        body: data.body,
        imageUrl: data.imageUrl,
      },
    });
    await this.prisma.match.update({
      where: { id: conversation.matchId },
      data: { status: 'CHAT_STARTED' },
    });
    const publicMessage = this.toPublicMessage(message);
    return {
      message: publicMessage,
      otherUserId: conversation.userAId === userId ? conversation.userBId : conversation.userAId,
    };
  }

  private toPublicMessage(message: {
    id: string;
    conversationId: string;
    senderId: string;
    type: MessageType;
    body: string;
    imageUrl: string | null;
    createdAt: Date;
  }) {
    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      type: message.type,
      body: message.body,
      imageUrl: message.imageUrl ? publicMediaUrl(message.imageUrl) || message.imageUrl : null,
      createdAt: message.createdAt.toISOString(),
    };
  }

  async requireParticipant(userId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.userAId !== userId && conversation.userBId !== userId) {
      throw new ForbiddenException();
    }
    return conversation;
  }
}
