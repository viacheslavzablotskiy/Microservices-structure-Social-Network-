import { Observable } from "rxjs";
import {UserRolePtroto} from './Login_User_Enity_Proto'
import { type TimeStamp } from "@repo/static-data";


export interface User_after_auth_service_login {
    id: number;
    isActivate: boolean;
    isVerified: boolean;
    avatarUrl: string;
    coverUrl: string;
    login: string;
    role: UserRolePtroto;
    createdAt: TimeStamp;
    updatedAt: TimeStamp;
    email: string;
    passwordHash: string
    refreshToken: RefreshData,
    accessToken: NewAccessToken
}


export interface RefreshData {
    refreshToken: string
}

export interface NewAccessToken {
    accessToken: string
}

export interface DistAuthPathInterface {
    registerUser(data: {login: string, email: string, password: string}) : Observable<{}>,
    loginUser(data: {email: string, password: string}) : Observable<User_after_auth_service_login>,
    refreshToken(data: RefreshData) : Observable<NewAccessToken>
}