import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserIntent, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UpdatePreferencesDto, UpdateProfileDto } from './dto';
import { toMe, toPublicProfile, userInclude } from './user.mapper';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async me(user: User) {
    const full = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: userInclude,
    });
    if (!full) throw new NotFoundException();
    return toMe(full);
  }

  async updateProfile(user: User, dto: UpdateProfileDto) {
    await this.prisma.profile.upsert({
      where: { userId: user.id },
      update: dto,
      create: { userId: user.id, firstName: dto.firstName || 'Member', ...dto },
    });
    if (dto.intent === UserIntent.LIST_PG && user.role === UserRole.USER) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { role: UserRole.PG_OWNER },
      });
    }
    return this.me(user);
  }

  async ensurePgOwner(userId: string) {
    const row = await this.prisma.user.findUnique({ where: { id: userId } });
    if (row?.role === UserRole.USER) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { role: UserRole.PG_OWNER },
      });
    }
  }

  async updatePreferences(user: User, dto: UpdatePreferencesDto) {
    const { languages, moveInDate, ...rest } = dto;
    await this.prisma.preference.upsert({
      where: { userId: user.id },
      update: {
        ...rest,
        moveInDate: moveInDate ? new Date(moveInDate) : undefined,
      },
      create: {
        userId: user.id,
        ...rest,
        moveInDate: moveInDate ? new Date(moveInDate) : undefined,
      },
    });
    if (languages) {
      await this.prisma.userLanguage.deleteMany({ where: { userId: user.id } });
      if (languages.length) {
        await this.prisma.userLanguage.createMany({
          data: languages.map((language) => ({ userId: user.id, language })),
        });
      }
    }
    return this.me(user);
  }

  async uploadPhoto(user: User, file: Express.Multer.File) {
    const url = await this.storage.upload(file, 'profiles');
    await this.prisma.profile.upsert({
      where: { userId: user.id },
      update: { photoUrl: url },
      create: { userId: user.id, firstName: 'Member', photoUrl: url },
    });
    return this.me(user);
  }

  async publicProfile(id: string) {
    const full = await this.prisma.user.findUnique({
      where: { id },
      include: userInclude,
    });
    if (!full) throw new NotFoundException('User not found');
    return toPublicProfile(full);
  }
}
