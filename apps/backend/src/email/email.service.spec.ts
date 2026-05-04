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
      if (key === 'sendMail') {
        return {
          host: 'smtp.test.example',
          port: 465,
          secure: true,
          auth: { user: 'test@example.com', pass: 'app-password' },
        };
      }
      const map: Record<string, string> = {
        'resetPassword.secret': 'test-secret',
        'resetPassword.expiresIn': '3600',
        'resetPassword.resetUrl': 'https://app.example/reset',
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
