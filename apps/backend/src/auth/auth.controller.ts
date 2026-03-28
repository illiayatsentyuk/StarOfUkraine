import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { signupDto } from './dto/signup.dto';
import { signinDto } from './dto/signin.dto';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { authExamples } from '../examples/auth/auth.examples';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    type: signupDto,
    examples: {
      signup: { value: authExamples.signupRequest },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: { example: authExamples.tokenResponse },
  })
  register(@Body() dto: signupDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login and receive access token' })
  @ApiBody({
    type: signinDto,
    examples: {
      signin: { value: authExamples.signinRequest },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully logged in',
    schema: { example: authExamples.tokenResponse },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    schema: { example: authExamples.unauthorized },
  })
  login(@Body() dto: signinDto) {
    return this.authService.login(dto);
  }

  @Post('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current authenticated user info (test endpoint)',
  })
  @ApiResponse({ status: 200, description: 'Authenticated request successful' })
  me() {
    // This endpoint is just to test JWT guard;
    // real implementation could return user profile from request.
    return { ok: true };
  }
}
