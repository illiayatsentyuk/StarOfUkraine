import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto, SignupDto } from './dto';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../common/decorators';
import { authExamples } from '../examples';

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
    schema: { example: authExamples.tokenResponse },
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async register(@Body() dto: SignupDto) {
    const tokens = await this.authService.signupLocal(dto);
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
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
    schema: { example: authExamples.tokenResponse },
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    schema: { example: authExamples.unauthorized },
  })
  async login(@Body() dto: SigninDto) {
    const tokens = await this.authService.signinLocal(dto);
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  @Post('me')
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
}
