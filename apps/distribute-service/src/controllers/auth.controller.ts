import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from '../providers/auth.service';
import {ZodValidationPipe} from '@repo/api';
import {LoginScema, RegisterSchema, type RegisterSchemaUser, type LoginScemaUser, User_Login_Data} from '@repo/user-interfaces'
import { type Response } from 'express';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('auth/register')
  async handleRegisterUser(
    @Body(new ZodValidationPipe(RegisterSchema)) dto: RegisterSchemaUser 
  ): Promise<void> {

    console.log('we begin proccess');
    
    await this.authService.handleregisterUser(dto)
  }


  @Post('auth/login')
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

  @Post('auth/logout')
  async handleLogoutUser(
    @Res() res: Response
  ): Promise<void> {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/'
    })
  }


}
