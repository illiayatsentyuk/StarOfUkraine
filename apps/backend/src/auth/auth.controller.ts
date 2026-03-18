import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { signupDto } from './dto/signup.dto';
import { signinDto } from './dto/signin.dto';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  register(@Body() dto: signupDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and receive access token' })
  @ApiResponse({ status: 201, description: 'User successfully logged in' })
  login(@Body() dto: signinDto) {
    return this.authService.login(dto);
  }

  @Post('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user info (test endpoint)' })
  @ApiResponse({ status: 200, description: 'Authenticated request successful' })
  me() {
    // This endpoint is just to test JWT guard;
    // real implementation could return user profile from request.
    return { ok: true };
  }
}

