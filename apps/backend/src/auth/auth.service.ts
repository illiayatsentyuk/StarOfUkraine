import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { signupDto } from './dto/signup.dto';
import { signinDto } from './dto/signin.dto';
import { JwtPayload } from '../common/types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: signupDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: dto.role,
      },
    });

    const token = this.createToken(user.id, user.email, user.role);

    return {
      accessToken: token,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(dto: signinDto) {
    const user = await this.validateUser(dto.email, dto.password);
    const token = this.createToken(user.id, user.email, user.role);
    return {
      accessToken: token,
    };
  }

  private createToken(sub: string, email: string, role: string) {
    const payload: JwtPayload = {
      sub,
      email,
      role: role as JwtPayload['role'],
    };

    return this.jwtService.sign(payload);
  }
}

