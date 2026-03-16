import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
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
  register(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and receive access token' })
  @ApiResponse({ status: 201, description: 'User successfully logged in' })
  login(@Body() dto: AuthCredentialsDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
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

