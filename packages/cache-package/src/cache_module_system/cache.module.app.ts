import { Module, type DynamicModule } from "@nestjs/common";
import KeyvRedis from '@keyv/redis';
import {CacheModule} from '@nestjs/cache-manager';
import { CacheService } from "./cache.provider";


@Module({})
export class CachePackageMdoule {
    static registerAsync(
        options: {
            inject: any[],
            useFactory: (...args: any[]) => {REDIS_URL: string}
        }
    ): DynamicModule {
        return {
            module: CachePackageMdoule,
            imports: [
                CacheModule.registerAsync({
                    inject: options.inject,
                    useFactory: (...args) => {
                        const { REDIS_URL } = options.useFactory(...args)
                        return {
                            stores: [new KeyvRedis(REDIS_URL)]
                        }
                    }
                })
            ],
            providers: [CacheService],
            controllers: [],
            exports: [CacheService]
        }
    }
}