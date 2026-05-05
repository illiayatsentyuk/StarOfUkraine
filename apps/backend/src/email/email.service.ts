import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createTransport } from 'nodemailer';
import type { SignOptions } from 'jsonwebtoken';
import type { Transporter } from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import { PrismaService } from '../prisma/prisma.service';

type SendMailConfig = {
  host: string;
  port: number;
  secure: boolean;
  auth: { user?: string; pass?: string };
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly nodemailerTransport: Transporter;
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const sendMail = this.configService.get<SendMailConfig>('sendMail');
    if (!sendMail?.host) {
      throw new Error('Missing sendMail config (EMAIL_HOST / sendMail namespace)');
    }
    this.nodemailerTransport = createTransport({
      host: sendMail.host,
      port: sendMail.port,
      secure: sendMail.secure,
      auth: sendMail.auth,
    });
  }

  async sendResetPasswordLink(email: string): Promise<void> {
    const secret = this.configService.get<string>('resetPassword.secret');
    const expiresIn = this.configService.get<string>(
      'resetPassword.expiresIn',
    );
    const resetUrlBase = this.configService.get<string>(
      'resetPassword.resetUrl',
    );

    if (!secret || !expiresIn || !resetUrlBase) {
      throw new Error(
        'Missing reset password config: RESET_PASSWORD_SECRET (or JWT_VERIFICATION_TOKEN_SECRET), RESET_PASSWORD_EXPIRES_IN (or JWT_VERIFICATION_TOKEN_EXPIRATION_TIME), EMAIL_RESET_PASSWORD_URL',
      );
    }
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    const payload = { email };
    const token = this.jwtService.sign(payload, {
      secret,
      expiresIn: expiresIn as SignOptions['expiresIn'],
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token },
    });

    const url = `${resetUrlBase}?token=${encodeURIComponent(token)}`;
    const text = `Hi,\nTo reset your password, click here: ${url}`;

    await this.sendMail({
      to: email,
      subject: 'Reset password',
      text,
    });
  }

  public async decodeConfirmationToken(token: string) {
        try {
            const payload = await this.jwtService.verify(token, {
                secret: this.configService.get<string>('resetPassword.secret'),
            });

            if (typeof payload === 'object' && 'email' in payload) {
                return payload.email;
            }
            throw new BadRequestException();
        } catch (error) {
            if (error?.name === 'TokenExpiredError') {
                throw new BadRequestException(
                    'Email confirmation token expired'
                );
            }
            throw new BadRequestException('Bad confirmation token');
        }
    }

  private async sendMail(options: Mail.Options): Promise<void> {
    this.logger.log(`Sending email to ${options.to} with subject ${options.subject}`);
    await this.nodemailerTransport.sendMail(options);
  }
}
