import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatsService {
  constructor(private prisma: PrismaService) {}

  async createOrGet(currentUserId: string, otherUserId: string) {
    const [user1Id, user2Id] = [currentUserId, otherUserId].sort();

    const existing = await this.prisma.chat.findFirst({
      where: { user1Id, user2Id },
    });

    if (existing) return existing;

    return this.prisma.chat.create({
      data: { user1Id, user2Id },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.chat.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        user1: { select: { id: true, username: true } },
        user2: { select: { id: true, username: true } },
      },
    });
  }
}
