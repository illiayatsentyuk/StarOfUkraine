import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SignupDto, SigninDto } from './dto';
import { Tokens } from './types';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../enum';
import { PrismaService } from '../prisma/prisma.service';
import type { ConfigType } from '@nestjs/config';
import type { SignOptions } from 'jsonwebtoken';
import jwtTokensConfig from '../config/jwt.config';
import { Inject } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject(jwtTokensConfig.KEY) private jwtConfig: ConfigType<typeof jwtTokensConfig>,
  ) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('No user found');
    if (user.role === Role.ADMIN) {
      return { user, message: 'Authenticated', role: 'admin' };
    }
    return { user, message: 'Authenticated', role: user.role };
  }

  async signupLocal(dto: SignupDto): Promise<Tokens> {
    const hash = await this.hashData(dto.password);
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const savedUser = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        hash,
        name: dto.name,
      },
    });

    const tokens = await this.getTokens(
      savedUser.id,
      savedUser.email,
      savedUser.role,
    );
    await this.updateRtHash(savedUser.id, tokens.refresh_token);
    return tokens;
  }

  async signinLocal(dto: SigninDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) throw new NotFoundException('No user found');

    const passwordMatches = await bcrypt.compare(dto.password, user.hash);
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(String(user.id), user.email, user.role);
    await this.updateRtHash(String(user.id), tokens.refresh_token);
    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: String(userId) },
      data: { hashedRt: null },
    });
  }

  async refreshTokens(userId: string, rt: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: String(userId) },
    });

    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');

    const rtMatches = await bcrypt.compare(rt, user.hashedRt);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(String(user.id), user.email, user.role);
    await this.updateRtHash(String(user.id), tokens.refresh_token);
    return tokens;
  }

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async getTokens(
    userId: string,
    email: string,
    role: Role,
  ): Promise<Tokens> {
    const atSecret = this.jwtConfig.at.secret;
    const rtSecret = this.jwtConfig.rt.secret;
    const atExpiresIn = this.jwtConfig.at.expiresIn;
    const rtExpiresIn = this.jwtConfig.rt.expiresIn;

    const atExpires = (atExpiresIn ?? '15m') as SignOptions['expiresIn'];
    const rtExpires = (rtExpiresIn ?? '7d') as SignOptions['expiresIn'];

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          secret: atSecret,
          expiresIn: atExpires,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          secret: rtSecret,
          expiresIn: rtExpires,
        },
      ),
    ]);
    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async updateRtHash(userId: string, rt: string) {
    const hash = await this.hashData(rt);
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRt: hash },
    });
  }
}