import { Observable } from 'rxjs';
import { TimeStamp } from '@repo/static-data';

export enum UserRolePtroto {
  USER_ROLE_UNSPECIFIED = 0,
  ADMIN = 1,
  USER = 2,
  GHOST = 3,
}

export interface User_Entity_After_Proto_UserEmail {
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
}

export interface User_Entity_After_Proto_UserId {
    id: number;
    isActivate: boolean;
    isVerified: boolean;
    avatarUrl: string;
    coverUrl: string;
    login: string;
    role: UserRolePtroto;
    createdAt: TimeStamp;
    updatedAt: TimeStamp;
}


export interface AuthServiceProto {
    registerUser(data: {login: string, email: string, password: string}) : Observable<{}>,
    getUserByEmail(data: {email: string}): Observable<User_Entity_After_Proto_UserEmail>,
    getUserById(data: {id: number}) : Observable<User_Entity_After_Proto_UserId>
}