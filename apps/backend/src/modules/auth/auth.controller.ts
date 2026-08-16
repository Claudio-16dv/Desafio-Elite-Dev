import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthUser, LoginResponse, Role } from '@app/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateGateUserDto } from './dto/create-gate-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthenticatedUser } from './strategies/jwt.strategy';
import { CreateGateUserUseCase } from './use-cases/create-gate-user.use-case';
import { GetMeUseCase } from './use-cases/get-me.use-case';
import { LoginUseCase } from './use-cases/login.use-case';
import { RegisterUseCase } from './use-cases/register.use-case';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly register: RegisterUseCase,
    private readonly login: LoginUseCase,
    private readonly getMe: GetMeUseCase,
    private readonly updateProfile: UpdateProfileUseCase,
    private readonly createGateUser: CreateGateUserUseCase,
  ) {}

  @Post('register')
  registerUser(@Body() dto: RegisterDto): Promise<LoginResponse> {
    return this.register.execute(dto);
  }

  @Post('gates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  registerGate(
    @CurrentUser() organizer: AuthenticatedUser,
    @Body() dto: CreateGateUserDto,
  ): Promise<AuthUser> {
    return this.createGateUser.execute(organizer.id, dto);
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

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<AuthUser> {
    return this.updateProfile.execute(user.id, dto);
  }
}
