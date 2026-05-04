import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createTransport } from 'nodemailer';
import type { SignOptions } from 'jsonwebtoken';
import type { Transporter } from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly nodemailerTransport: Transporter;
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.nodemailerTransport = createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: configService.get('EMAIL_USER'),
            pass: configService.get('EMAIL_PASSWORD')
        }
    });
  }

  async sendResetPasswordLink(email: string): Promise<void> {
    const secret = this.configService.get<string>(
      'JWT_VERIFICATION_TOKEN_SECRET',
    );
    const expirationSeconds = this.configService.get<string>(
      'JWT_VERIFICATION_TOKEN_EXPIRATION_TIME',
    );
    const resetUrlBase = this.configService.get<string>(
      'EMAIL_RESET_PASSWORD_URL',
    );

    if (!secret || !expirationSeconds || !resetUrlBase) {
      throw new Error(
        'Missing JWT_VERIFICATION_TOKEN_SECRET, JWT_VERIFICATION_TOKEN_EXPIRATION_TIME, or EMAIL_RESET_PASSWORD_URL',
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
      expiresIn: expirationSeconds as SignOptions['expiresIn'],
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
                secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET')
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
