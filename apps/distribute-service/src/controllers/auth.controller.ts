import { Body, Controller, Post, Res, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from '../providers/auth.service';
import {RpcExceptionFilter, ZodValidationPipe} from '@repo/api';
import {LoginScema, RegisterSchema, type RegisterSchemaUser, type LoginScemaUser, User_Login_Data} from '@repo/user-interfaces'
import { type Response } from 'express';
import { ApiBearerAuth, ApiBody, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto, RegisterDto, LoginOutDto } from 'src/documentation_classes/auth.swagger';
import {JWTAuthGuard} from '@repo/api'
import { HttpEXceptionFilter } from 'src/settings/custom.useFilter';
import { TimersIntercertor } from 'src/settings/main.interceptors';

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('auth/register')
  @ApiOperation({summary: 'Registration peoples', description: 'create new user based on some datas'})
  @ApiBody({type: RegisterDto})
  @UseInterceptors(TimersIntercertor)
  @ApiResponse({status: 201, description: 'User successuflly added'})
  async handleRegisterUser(
    @Body(new ZodValidationPipe(RegisterSchema)) dto: RegisterSchemaUser 
  ): Promise<void> {
    await this.authService.handleregisterUser(dto)
  }


  @Post('auth/login')
  @ApiOperation({summary: 'Login', description: 'Login recently created user or already exiting'})
  @ApiBody({type: LoginDto})
  @ApiResponse({status: 201, description: 'You entered successfully', type: LoginOutDto})
  @UseFilters(new HttpEXceptionFilter())
  async handleLoginUser(
    @Body(new ZodValidationPipe(LoginScema)) dto: LoginScemaUser, @Res({passthrough: true}) res: Response): Promise<Omit<User_Login_Data, 'refreshToken'>>
  {
    const {response, accessToken, refreshToken} = await this.authService.handleloginUser(dto)

    res.cookie('refresh_token', refreshToken, {
        sameSite: 'strict',
        httpOnly: true,
        secure: true,
        path: '/'
    })

    return {
      response,
      accessToken
    }
  }

  @ApiCookieAuth()
  @ApiBearerAuth('auth-part')
  @UseGuards(JWTAuthGuard)
  @Post('auth/logout')
  @ApiOperation({summary: 'Logout', description: 'Logout current user'})
  @ApiResponse({status: 201, description: 'Logout successfully completed'})
  async handleLogoutUser(
    @Res({passthrough: true}) res: Response
  ): Promise<void> {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/'
    })
  }


}
