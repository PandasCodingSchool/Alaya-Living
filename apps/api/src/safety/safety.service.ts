import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toPublicProfile, userInclude } from '../users/user.mapper';

@Injectable()
export class SafetyService {
  constructor(private readonly prisma: PrismaService) {}

  async block(fromUserId: string, toUserId: string) {
    await this.prisma.block.upsert({
      where: { fromUserId_toUserId: { fromUserId, toUserId } },
      update: {},
      create: { fromUserId, toUserId },
    });
    return { ok: true };
  }

  async list(userId: string) {
    const blocks = await this.prisma.block.findMany({
      where: { fromUserId: userId },
      include: { toUser: { include: userInclude } },
    });
    return blocks.map((b) => ({ id: b.id, user: toPublicProfile(b.toUser), createdAt: b.createdAt }));
  }
}
