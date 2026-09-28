import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SavedSearchKind } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavedSearchesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(userId: string, data: { name: string; kind: SavedSearchKind; filters: Record<string, unknown> }) {
    return this.prisma.savedSearch.create({
      data: { userId, name: data.name, kind: data.kind, filters: data.filters as Prisma.InputJsonValue },
    });
  }

  async remove(userId: string, id: string) {
    const row = await this.prisma.savedSearch.findFirst({ where: { id, userId } });
    if (!row) throw new NotFoundException('Saved search not found');
    await this.prisma.savedSearch.delete({ where: { id } });
    return { ok: true };
  }
}
