import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';

const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: (...args: unknown[]) => mockSendMail(...args),
  }),
}));

describe('EmailService', () => {
  let service: EmailService;

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('signed-jwt'),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const map: Record<string, string> = {
        JWT_VERIFICATION_TOKEN_SECRET: 'test-secret',
        JWT_VERIFICATION_TOKEN_EXPIRATION_TIME: '3600',
        EMAIL_RESET_PASSWORD_URL: 'https://app.example/reset',
        EMAIL_USER: 'test@example.com',
        EMAIL_PASSWORD: 'app-password',
      };
      return map[key];
    }),
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    mockSendMail.mockClear();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendResetPasswordLink', () => {
    it('finds user, stores reset token, and sends email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'a@b.com',
      });
      mockPrisma.user.update.mockResolvedValue({});

      await service.sendResetPasswordLink('a@b.com');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'a@b.com' },
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { resetToken: 'signed-jwt' },
      });
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'a@b.com',
          subject: 'Reset password',
        }),
      );
    });
  });
});
