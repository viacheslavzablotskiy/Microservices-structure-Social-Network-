import {Injectable } from "@nestjs/common";
import {PassportStrategy} from '@nestjs/passport'
import { ExtractJwt, Strategy } from "passport-jwt";
import {ConfigService} from '@nestjs/config'

export interface JwtTokenDto {
    userId: number,
    login: string,
}

@Injectable()
export class AuthGuardStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || ''
        })
    }

    async validate(payload: {sub: number, login: string}) : Promise<JwtTokenDto>
    {   // sub is userId
        console.log('Data we get from reqeust token', payload);
        
        return {userId: payload.sub, login: payload.login}
    }
}

