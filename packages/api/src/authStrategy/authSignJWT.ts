import { Injectable, Inject } from "@nestjs/common";
import {JwtService} from '@nestjs/jwt'



@Injectable()
export class AuthCreationToken {
    constructor(
        private jwtService: JwtService,
        @Inject('JWT_REFRESH_SECRET')
        private readonly refreshTokenSecret: string
    ) {}

    async creationAccessToken(user: {id: number, login: string}) {
        const payload = {sub: user.id, login: user.login}

        console.log('Data for creation token', payload);

        return {
            accessToken: await this.jwtService.signAsync(payload)
        }
    }

    async createtionRefreshToken(user: {id: number, login: string}) {
        const payload = {sub: user.id}

        console.log('Create refresh-token', payload);
        
        return {
            refreshToken: await this.jwtService.signAsync(payload, { expiresIn: '7d', secret: this.refreshTokenSecret})
        }
    }

    async getDataFromRefreshToken(refrechToken: string): Promise<{id: number, login: string}> {
        
        const payload = this.jwtService.verifyAsync(refrechToken, {
            secret: this.refreshTokenSecret
        })

        return payload
    }
}