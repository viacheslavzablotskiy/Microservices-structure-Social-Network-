import { Module, DynamicModule, Inject } from '@nestjs/common'
import { AuthCreationToken } from './authSignJWT';
import { AuthGuardStrategy } from './authStrategy.guard';
import { JWTAuthGuard } from './authJWTGuard';



@Module({})
export class AuthStragetyModule {
    static registerAsync(options: {
        inject: any[],
        useFactory: (...args: any[]) => {refrechTokenSecret: string}
    }): DynamicModule {
        return {
            module: AuthStragetyModule,
            providers: [AuthCreationToken, AuthGuardStrategy, JWTAuthGuard,
                {
                    provide: 'JWT_REFRESH_SECRET',
                    inject: options.inject,
                    useFactory: (...args: any[]) => options.useFactory(...args).refrechTokenSecret
                }
            ],
            controllers: [],
            exports: [AuthCreationToken, AuthGuardStrategy, JWTAuthGuard],
        }
    }
}