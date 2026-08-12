import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthUser, LoginResponse } from '@app/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedUser } from './strategies/jwt.strategy';
import { GetMeUseCase } from './use-cases/get-me.use-case';
import { LoginUseCase } from './use-cases/login.use-case';
import { RegisterUseCase } from './use-cases/register.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly register: RegisterUseCase,
    private readonly login: LoginUseCase,
    private readonly getMe: GetMeUseCase,
  ) {}

  @Post('register')
  registerUser(@Body() dto: RegisterDto): Promise<LoginResponse> {
    return this.register.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  loginUser(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.login.execute(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser): Promise<AuthUser> {
    return this.getMe.execute(user.id);
  }
}
