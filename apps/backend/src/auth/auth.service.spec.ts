import { UnauthorizedException } from '@nestjs/common';
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
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'user@example.com',
    password: 'hashed-password',
    name: 'Ivan Petrenko',
    role: Role.USER,
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

  describe('register', () => {
    it('hashes password, creates user and returns access token', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register({
        email: 'user@example.com',
        password: 'plain-password',
        name: 'Ivan Petrenko',
        role: Role.USER,
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('plain-password', 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'user@example.com',
          password: 'hashed-password',
          name: 'Ivan Petrenko',
          role: Role.USER,
        },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'user@example.com',
        role: Role.USER,
      });
      expect(result).toEqual({ accessToken: 'jwt-token' });
    });
  });

  describe('validateUser', () => {
    it('returns user when credentials are valid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        'user@example.com',
        'plain-password',
      );

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'plain-password',
        'hashed-password',
      );
      expect(result).toEqual(mockUser);
    });

    it('throws UnauthorizedException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.validateUser('missing@example.com', 'plain-password'),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });

    it('throws UnauthorizedException when password is invalid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser('user@example.com', 'wrong-password'),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });
  });

  describe('login', () => {
    it('returns access token for valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login({
        email: 'user@example.com',
        password: 'plain-password',
      });

      expect(result).toEqual({ accessToken: 'jwt-token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'user@example.com',
        role: Role.USER,
      });
    });

    it('rethrows UnauthorizedException when credentials are invalid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'missing@example.com',
          password: 'plain-password',
        }),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });
  });
});
