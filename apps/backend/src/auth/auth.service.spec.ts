import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { getLoggerToken } from 'pino-nestjs';
import jwtTokensConfig from '../config/jwt.config';
import { EmailService } from '../email/email.service';
import { AuthProvider, Role } from '../enum';
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
    account: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockJwtConfig = {
    secret: 'jwt-secret-test',
    at: { secret: 'at-secret-test', expiresIn: '15m' },
    rt: { secret: 'rt-secret-test', expiresIn: '7d' },
    signOptions: { expiresIn: '1d' },
  };

  const mockEmailService = {
    sendResetPasswordLink: jest.fn(),
    decodeConfirmationToken: jest.fn(),
  };

  const mockPinoLogger = {
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
    setContext: jest.fn(),
    assign: jest.fn(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'user@example.com',
    hash: 'hashed-password',
    name: 'Ivan Petrenko',
    role: Role.USER,
    hashedRt: 'hashed-rt',
  };

  const publicUserFields = {
    id: 'user-1',
    email: 'user@example.com',
    name: 'Ivan Petrenko',
    nameId: null as string | null,
    image: null as string | null,
    role: Role.USER,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const userSelectArgs = {
    where: { id: 'user-1' },
    select: {
      id: true,
      email: true,
      name: true,
      nameId: true,
      image: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
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
          provide: jwtTokensConfig.KEY,
          useValue: mockJwtConfig,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: getLoggerToken(AuthService.name),
          useValue: mockPinoLogger,
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
      (bcrypt.hash as jest.Mock)
        .mockResolvedValueOnce('hashed-password')
        .mockResolvedValueOnce('hashed-rt');

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        hashedRt: 'hashed-rt',
      });

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
          nameId: expect.stringMatching(/^ivan-petrenko-\d{1,4}$/),
          resetToken: '',
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
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        hashedRt: 'hashed-rt',
      });

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
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'plain-password',
        'hashed-password',
      );

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
        service.signinLocal({
          email: 'missing@example.com',
          password: 'plain-password',
        }),
      ).rejects.toThrow(new NotFoundException('No user found'));
    });

    it('throws ForbiddenException when password is invalid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.signinLocal({
          email: 'user@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(new ForbiddenException('Access Denied'));
    });
  });

  describe('getMe', () => {
    it('returns public user fields for a regular user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(publicUserFields);

      const result = await service.getMe('user-1');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(userSelectArgs);
      expect(result).toEqual(publicUserFields);
    });

    it('returns public fields for an admin user', async () => {
      const adminPublic = { ...publicUserFields, role: Role.ADMIN };
      mockPrisma.user.findUnique.mockResolvedValue(adminPublic);

      const result = await service.getMe('user-1');

      expect(result).toEqual(adminPublic);
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getMe('missing-id')).rejects.toThrow(
        new NotFoundException('No user found'),
      );
    });
  });

  describe('logout', () => {
    it('clears stored refresh token hash', async () => {
      mockPrisma.user.update.mockResolvedValue(mockUser);

      await service.logout('user-1');

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { hashedRt: null },
      });
    });
  });

  describe('refreshTokens', () => {
    it('returns new tokens when refresh token matches stored hash', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-rt');

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        hashedRt: 'new-hashed-rt',
      });

      mockJwtService.signAsync
        .mockResolvedValueOnce('new-at')
        .mockResolvedValueOnce('new-rt');

      const result = await service.refreshTokens('user-1', 'raw-refresh-jwt');

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'raw-refresh-jwt',
        mockUser.hashedRt,
      );
      expect(result).toEqual({
        access_token: 'new-at',
        refresh_token: 'new-rt',
      });
    });

    it('throws ForbiddenException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.refreshTokens('missing', 'raw-refresh-jwt'),
      ).rejects.toThrow(new ForbiddenException('Access Denied'));
    });

    it('throws ForbiddenException when user has no stored refresh hash', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        hashedRt: null,
      });

      await expect(
        service.refreshTokens('user-1', 'raw-refresh-jwt'),
      ).rejects.toThrow(new ForbiddenException('Access Denied'));
    });

    it('throws ForbiddenException when refresh token does not match', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.refreshTokens('user-1', 'wrong-refresh-jwt'),
      ).rejects.toThrow(new ForbiddenException('Access Denied'));
    });
  });

  describe('findOrCreateFromGoogle', () => {
    const googleProfile = {
      id: 'google-sub-1',
      email: 'oauth@example.com',
      name: 'OAuth User',
    };

    it('returns existing user when Google account is already linked', async () => {
      mockPrisma.account.findUnique.mockResolvedValue({
        user: mockUser,
      });

      const result = await service.findOrCreateFromGoogle(googleProfile);

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
      expect(mockPrisma.account.create).not.toHaveBeenCalled();
    });

    it('creates user and account for a new Google identity', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const newUser = {
        ...mockUser,
        id: 'new-user-id',
        email: 'oauth@example.com',
        name: 'OAuth User',
        hash: null,
      };
      mockPrisma.user.create.mockResolvedValue(newUser);
      mockPrisma.account.create.mockResolvedValue({});

      const result = await service.findOrCreateFromGoogle(googleProfile);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'oauth@example.com',
          name: 'OAuth User',
          nameId: expect.stringMatching(/^oauth-user-\d{1,4}$/),
          resetToken: '',
        },
      });
      expect(mockPrisma.account.create).toHaveBeenCalledWith({
        data: {
          userId: 'new-user-id',
          provider: AuthProvider.GOOGLE,
          providerAccountId: 'google-sub-1',
        },
      });
      expect(result).toEqual(newUser);
    });

    it('links Google account to an existing user with the same email', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.account.create.mockResolvedValue({});

      const profileSameEmail = {
        id: 'google-sub-new',
        email: 'user@example.com',
        name: 'Linked',
      };

      const result = await service.findOrCreateFromGoogle(profileSameEmail);

      expect(mockPrisma.user.create).not.toHaveBeenCalled();
      expect(mockPrisma.account.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          provider: AuthProvider.GOOGLE,
          providerAccountId: 'google-sub-new',
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('forgotPassword', () => {
    it('calls email service when user exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await service.forgotPassword('user@example.com');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
      expect(mockEmailService.sendResetPasswordLink).toHaveBeenCalledWith(
        'user@example.com',
      );
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.forgotPassword('missing@example.com'),
      ).rejects.toThrow(NotFoundException);
      expect(mockEmailService.sendResetPasswordLink).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('hashes password and updates user hash, clears refresh token', async () => {
      mockEmailService.decodeConfirmationToken.mockResolvedValue(
        'user@example.com',
      );
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        hash: 'new-hashed-password',
        hashedRt: null,
      });

      await service.resetPassword('jwt-token', 'newPassword1!');

      expect(mockEmailService.decodeConfirmationToken).toHaveBeenCalledWith(
        'jwt-token',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword1!', 10);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          hash: 'new-hashed-password',
          hashedRt: null,
          resetToken: '',
        },
      });
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockEmailService.decodeConfirmationToken.mockResolvedValue(
        'missing@example.com',
      );
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.resetPassword('t', 'pw')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });
  });
});
