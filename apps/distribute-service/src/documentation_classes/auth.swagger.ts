import {LoginScema, RegisterSchema, User_Entity_Login_OutputData, User_Login_Data} from '@repo/user-interfaces'
import {createZodDto} from 'nestjs-zod'
import {UserRole} from "@repo/static-data"

export class LoginDto extends createZodDto(LoginScema){}

export class RegisterDto extends createZodDto(RegisterSchema){}

export class UserEntityLoginOut implements User_Entity_Login_OutputData {
    id: number;
    isActivate: boolean;
    isVerified: boolean;
    coverUrl: string;
    avatarUrl: string;
    login: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export class LoginOutDto implements Omit<User_Login_Data, 'refreshToken'> {
    response: UserEntityLoginOut
    accessToken: { accessToken: string; };
}


