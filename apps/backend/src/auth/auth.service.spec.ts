import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Role } from '../enum';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockPrisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const map: Record<string, string> = {
        'jwt.at.secret': 'at-secret-test',
        'jwt.rt.secret': 'rt-secret-test',
        'jwt.at.expiresIn': '15m',
        'jwt.rt.expiresIn': '7d',
      };
      return map[key];
    }),
  };

  const mockUser = {
    id: 'user-1',
    email: 'user@example.com',
    hash: 'hashed-password',
    name: 'Ivan Petrenko',
    role: Role.USER,
    hashedRt: 'hashed-rt',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signupLocal', () => {
    it('creates user, returns tokens, and stores refresh token hash', async () => {
      // 1st bcrypt.hash -> password, 2nd bcrypt.hash -> refresh token hash
      (bcrypt.hash as jest.Mock)
        .mockResolvedValueOnce('hashed-password')
        .mockResolvedValueOnce('hashed-rt');

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, hashedRt: 'hashed-rt' });

      mockJwtService.signAsync
        .mockResolvedValueOnce('at-token')
        .mockResolvedValueOnce('rt-token');

      const result = await service.signupLocal({
        email: 'USER@EXAMPLE.COM',
        password: 'plain-password',
        name: 'Ivan Petrenko',
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'user@example.com',
          hash: 'hashed-password',
          name: 'Ivan Petrenko',
        },
      });

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { hashedRt: 'hashed-rt' },
      });

      expect(result).toEqual({
        access_token: 'at-token',
        refresh_token: 'rt-token',
      });
    });

    it('throws BadRequestException when email already in use', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.signupLocal({
          email: 'user@example.com',
          password: 'plain-password',
          name: 'Ivan Petrenko',
        }),
      ).rejects.toThrow(new BadRequestException('Email already in use'));
    });
  });

  describe('signinLocal', () => {
    it('returns tokens when credentials are valid and stores refresh token hash', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-rt');

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, hashedRt: 'hashed-rt' });

      mockJwtService.signAsync
        .mockResolvedValueOnce('at-token')
        .mockResolvedValueOnce('rt-token');

      const result = await service.signinLocal({
        email: 'USER@EXAMPLE.COM',
        password: 'plain-password',
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('plain-password', 'hashed-password');

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { hashedRt: 'hashed-rt' },
      });

      expect(result).toEqual({
        access_token: 'at-token',
        refresh_token: 'rt-token',
      });
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.signinLocal({ email: 'missing@example.com', password: 'plain-password' }),
      ).rejects.toThrow(new NotFoundException('No user found'));
    });

    it('throws ForbiddenException when password is invalid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.signinLocal({ email: 'user@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(new ForbiddenException('Access Denied'));
    });
  });
});
