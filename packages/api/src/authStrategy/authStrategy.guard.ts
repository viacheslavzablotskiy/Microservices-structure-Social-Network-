import {Injectable } from "@nestjs/common";
import {PassportStrategy} from '@nestjs/passport'
import { ExtractJwt, Strategy } from "passport-jwt";
import {ConfigService} from '@nestjs/config'


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

    async validate(payload: {sub: number, login: string, role: string}) : Promise<{userId: number, login: string, role: string}>
    {   // sub is userId
        console.log('Data we get from reqeust token', payload);
        
        return {userId: payload.sub, login: payload.login, role: payload.role}
    }
}

