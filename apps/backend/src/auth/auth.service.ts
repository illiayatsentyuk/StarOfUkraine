import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { SignOptions } from 'jsonwebtoken';
import { InjectPinoLogger, PinoLogger } from 'pino-nestjs';
import { OAuthUserPayload } from '../common/types';
import jwtTokensConfig from '../config/jwt.config';
import { EmailService } from '../email/email.service';
import { AuthProvider, Role } from '../enum';
import { PrismaService } from '../prisma/prisma.service';
import { SigninDto, SignupDto } from './dto';
import { Tokens } from './types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject(jwtTokensConfig.KEY)
    private jwtConfig: ConfigType<typeof jwtTokensConfig>,
    private emailService: EmailService,
    @InjectPinoLogger(AuthService.name)
    private readonly logger: PinoLogger,
  ) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        nameId: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        teamsAsCaptain: { select: { id: true, name: true } },
        teamsAsMember: { select: { id: true, name: true } },
      },
    });
    if (!user) throw new NotFoundException('No user found');
    return user;
  }

  async signupLocal(dto: SignupDto): Promise<Tokens> {
    const hash = await this.hashData(dto.password);
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const nameId = `${dto.name?.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(Math.random() * 10000)}`;

    const savedUser = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        hash,
        name: dto.name,
        nameId,
        resetToken: '',
      },
    });

    const tokens = await this.getTokens(
      savedUser.id,
      savedUser.email,
      savedUser.role,
    );
    await this.updateRtHash(savedUser.id, tokens.refresh_token);
    this.logger.info({ userId: savedUser.id }, 'User signed up (local)');
    return tokens;
  }

  async signinLocal(dto: SigninDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) throw new NotFoundException('No user found');

    const passwordMatches = await bcrypt.compare(dto.password, user.hash ?? '');
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(String(user.id), user.email, user.role);
    await this.updateRtHash(String(user.id), tokens.refresh_token);
    this.logger.info({ userId: user.id }, 'User signed in (local)');
    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: String(userId) },
      data: { hashedRt: null },
    });
    this.logger.info({ userId }, 'User logged out');
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
    this.logger.debug({ userId: user.id }, 'Access tokens refreshed');
    return tokens;
  }

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async getTokens(userId: string, email: string, role: Role): Promise<Tokens> {
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

  async findOrCreateFromGoogle(profile: OAuthUserPayload) {
    const existingAccount = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: AuthProvider.GOOGLE,
          providerAccountId: profile.id,
        },
      },
      include: { user: true },
    });

    if (existingAccount) {
      if (
        profile.picture &&
        (!existingAccount.user.image ||
          existingAccount.user.image !== profile.picture)
      ) {
        const updated = await this.prisma.user.update({
          where: { id: existingAccount.user.id },
          data: { image: profile.picture },
        });
        this.logger.debug(
          { userId: updated.id, provider: 'GOOGLE' },
          'Google profile image synced',
        );
        return updated;
      }
      this.logger.debug(
        { userId: existingAccount.user.id, provider: 'GOOGLE' },
        'Google sign-in (existing account)',
      );
      return existingAccount.user;
    }

    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (!user) {
      const nameId = `${profile.name?.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(Math.random() * 10000)}`;
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          nameId,
          resetToken: '',
        },
      });
      this.logger.info(
        { userId: user.id, provider: 'GOOGLE' },
        'User created from Google OAuth',
      );
    }
    if (
      user &&
      profile.picture &&
      (!user.image || user.image !== profile.picture)
    ) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { image: profile.picture },
      });
    }

    await this.prisma.account.create({
      data: {
        userId: user.id,
        provider: AuthProvider.GOOGLE,
        providerAccountId: profile.id,
      },
    });

    this.logger.info(
      { userId: user.id, provider: 'GOOGLE' },
      'Linked new Google account to user',
    );
    return user;
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }
    await this.emailService.sendResetPasswordLink(email);
    this.logger.info({ userId: user.id }, 'Password reset email requested');
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const emailFromToken =
      await this.emailService.decodeConfirmationToken(token);
    const email =
      typeof emailFromToken === 'string'
        ? emailFromToken.toLowerCase()
        : String(emailFromToken).toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    const hash = await this.hashData(password);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        hash,
        hashedRt: null,
        resetToken: '',
      },
    });
    this.logger.info({ userId: user.id }, 'Password reset completed');
  }
}
