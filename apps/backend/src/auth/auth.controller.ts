import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import type { Response } from 'express'
import { Role } from 'src/enum'
import {
  GetCurrentOAuthUser,
  GetCurrentUser,
  GetCurrentUserId,
  Public,
} from '../common/decorators'
import { GoogleAuthGuard } from '../common/guards'
import { RtGuard } from '../common/guards/rt.guard'
import { authExamples } from '../examples'
import type { AuthService } from './auth.service'
import { SigninDto, SignupDto } from './dto'
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates an account and sets `access_token` and `refresh_token` as HttpOnly cookies.',
  })
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
  @ApiResponse({
    status: 400,
    description: 'Validation failed or email already in use',
    schema: { example: authExamples.emailAlreadyInUse },
  })
  async register(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signupLocal(dto)
    this.setAuthCookies(res, tokens.access_token, tokens.refresh_token)
    return {
      ok: true,
    }
  }

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Login',
    description:
      'Validates credentials and sets `access_token` and `refresh_token` as HttpOnly cookies.',
  })
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
    status: 404,
    description: 'No user with this email',
    schema: { example: authExamples.userNotFound },
  })
  @ApiResponse({
    status: 403,
    description: 'Invalid password',
    schema: { example: authExamples.accessDenied },
  })
  async login(
    @Body() dto: SigninDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signinLocal(dto)
    this.setAuthCookies(res, tokens.access_token, tokens.refresh_token)
    return {
      ok: true,
    }
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @ApiCookieAuth('refresh_token')
  @ApiOperation({
    summary: 'Refresh tokens',
    description:
      'Requires a valid refresh token in the HttpOnly `refresh_token` cookie (or Bearer refresh JWT if configured).',
  })
  @ApiResponse({
    status: 201,
    description: 'Tokens successfully refreshed',
    schema: { example: authExamples.okResponse },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({
    status: 403,
    description: 'Invalid or revoked refresh token',
    schema: { example: authExamples.accessDenied },
  })
  async refreshTokens(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refreshTokens(userId, refreshToken)
    this.setAuthCookies(res, tokens.access_token, tokens.refresh_token)
    return { ok: true }
  }

  @Post('logout')
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (clears HttpOnly cookies)' })
  @ApiResponse({
    status: 201,
    description: 'Logged out',
    schema: { example: authExamples.okResponse },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  async logout(
    @GetCurrentUserId() userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(userId)
    this.clearAuthCookies(res)
    return { ok: true }
  }

  @Post('me')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Current user profile',
    description:
      'Returns the authenticated user (no password hashes). Requires `access_token` cookie or Bearer access JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user',
    schema: { example: authExamples.meResponse },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: { example: authExamples.userNotFound },
  })
  me(@GetCurrentUserId() userId: string) {
    return this.authService.getMe(userId)
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  @ApiOperation({
    summary: 'Start Google OAuth',
    description:
      'Redirects the browser to Google’s consent screen. After approval, Google redirects to `GET /auth/google/callback`.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to Google authorization',
  })
  googleLogin() {
    // here we should redirect to google login page
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  @ApiOperation({
    summary: 'Google OAuth callback',
    description:
      'Completes OAuth; issues access and refresh tokens as HttpOnly cookies and returns `{ ok: true }`.',
  })
  @ApiResponse({
    status: 200,
    description: 'Signed in; cookies set',
    schema: { example: authExamples.okResponse },
  })
  @ApiResponse({
    status: 401,
    description: 'OAuth failed or was denied',
    schema: { example: authExamples.unauthorized },
  })
  async googleCallback(
    @GetCurrentOAuthUser() user: { sub: string; email: string; role: Role },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.getTokens(
      user.sub,
      user.email,
      user.role,
    )

    this.setAuthCookies(res, tokens.access_token, tokens.refresh_token)
    return {
      ok: true,
    }
  }

  private setAuthCookies(res: Response, at: string, rt: string) {
    const isProd = process.env.NODE_ENV === 'production'
    res.cookie('access_token', at, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    })
    res.cookie('refresh_token', rt, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
  }

  private clearAuthCookies(res: Response) {
    const isProd = process.env.NODE_ENV === 'production'
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
    })
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/auth/refresh',
    })
  }
}
