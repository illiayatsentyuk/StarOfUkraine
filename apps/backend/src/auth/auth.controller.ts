import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto, SignupDto } from './dto';
import type { Response } from 'express';

import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetCurrentOAuthUser,
  GetCurrentUser,
  GetCurrentUserId,
  Public,
} from '../common/decorators';
import { authExamples } from '../examples';
import { RtGuard } from '../common/guards/rt.guard';
import { GoogleAuthGuard } from '../common/guards';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    type: SignupDto,
    examples: {
      signup: { value: authExamples.signupRequest },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: { example: authExamples.okResponse },
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async register(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signupLocal(dto);
    this.setAuthCookies(res, tokens.access_token, tokens.refresh_token);
    return {
      ok: true,
    };
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login and receive access token' })
  @ApiBody({
    type: SigninDto,
    examples: {
      signin: { value: authExamples.signinRequest },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully logged in',
    schema: { example: authExamples.okResponse },
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    schema: { example: authExamples.unauthorized },
  })
  async login(
    @Body() dto: SigninDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signinLocal(dto);
    this.setAuthCookies(res, tokens.access_token, tokens.refresh_token);
    return {
      ok: true,
    };
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh tokens (HttpOnly cookie)' })
  @ApiResponse({
    status: 201,
    description: 'Tokens successfully refreshed',
    schema: { example: authExamples.okResponse },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access Denied' })
  async refreshTokens(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refreshTokens(userId, refreshToken);
    this.setAuthCookies(res, tokens.access_token, tokens.refresh_token);
    return { ok: true };
  }

  @Post('logout')
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (clears HttpOnly cookies)' })
  @ApiResponse({
    status: 201,
    description: 'Logged out',
    schema: { example: { ok: true } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @GetCurrentUserId() userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(userId);
    this.clearAuthCookies(res);
    return { ok: true };
  }

  @Post('me')
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current authenticated user info (test endpoint)',
  })
  @ApiResponse({
    status: 200,
    description: 'Authenticated request successful',
    schema: { example: authExamples.meResponse },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  me() {
    // This endpoint is just to test JWT guard;
    // real implementation could return user profile from request.
    return { ok: true };
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@GetCurrentOAuthUser() user: any, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.getTokens(user.sub, user.email, user.role);


    this.setAuthCookies(res, tokens.access_token, tokens.refresh_token);
    return {
      ok: true,
    };
  }

  private setAuthCookies(res: Response, at: string, rt: string) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('access_token', at, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', rt, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearAuthCookies(res: Response) {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/auth/refresh',
    });
  }
}
