import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toPublicProfile, userInclude } from '../users/user.mapper';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

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
        lastMessage: c.messages[0] ?? null,
      };
    });
  }

  async messages(userId: string, conversationId: string) {
    const conversation = await this.requireParticipant(userId, conversationId);
    const messages = await this.prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
    });
    return messages;
  }

  async send(userId: string, conversationId: string, body: string) {
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
      data: { conversationId, senderId: userId, body },
    });
    await this.prisma.match.update({
      where: { id: conversation.matchId },
      data: { status: 'CHAT_STARTED' },
    });
    return message;
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
