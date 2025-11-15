import type {UserRole} from '@repo/static-data'
export enum RelationUsers {
    FRIEND = 'friend',
    FOLLOW = 'follow',
    BLOCK = 'block'
}

export enum GenderUser {
    NONE = 'none',
    WOMEN = 'women',
    MAN = 'man',
}

export enum ThemeSettings  {
    DARK = 'dark',
    WHITE = 'white'
}

export interface User_Profile {
    id: number,
    firstname: string,
    lastname: string,
    bio: string,
    location: string,
    website: string,
    birtday: Date,
    gender: GenderUser
}

export interface User_Realation {
    id: number,
    sourceUserId: number,
    targetUserId: number,
    typeAction: RelationUsers
}

export interface User_Security {
    id: number,
    email: string,
    passwordHash: string,
    passwordConfirm: string,
    twoFactorEnabled: boolean
}


export interface User_Settings {
    id: number,
    theme: ThemeSettings
    language: string,
    isPrivate: boolean
}

export interface User_Stats {
    id: number,
    postsCOunt: number,
    followersCount: number,
    followingCount: number,
    likesCount: number,
}


export interface User_Entity {
    id: number,
    isActivate: boolean,
    isVerified: boolean,
    avatarUrl: string,
    coverUrl: string,
    login: string,
    role: UserRole,
    createdAt: Date,
    updatedAt: Date,
    profile: User_Profile,
    settings: User_Settings,
    stats: User_Stats,
    security: User_Security
}


export type User_Entity_Login = Omit<User_Entity, 'stats' | 'settings' | 'security' | 'profile'> & {
    email: string, passwordHash: string
}

export type User_Entity_Login_OutputData = Omit<User_Entity, 'stats' | 'settings' | 'security' | 'profile'>

export interface User_Login_Data {
    response: User_Entity_Login_OutputData,
    accessToken: {
        accessToken: string
    },
    refreshToken: {
        refreshToken: string
    }
}