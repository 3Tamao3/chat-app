import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findMe(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    const { passwordHash: _passwordHash, ...result } = user!;
    return result;
  }

  async search(username: string) {
    return this.prisma.user.findMany({
      where: { username: { contains: username, mode: 'insensitive' } },
      select: { id: true, username: true, email: true },
    });
  }
}
