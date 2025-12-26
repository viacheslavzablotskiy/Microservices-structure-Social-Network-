import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { from, Observable, of, switchMap, tap } from "rxjs";
import {CacheService} from '@repo/chache-package'
import {ConfigService} from '@nestjs/config'
import { Request } from "express";
import { Post_Enitity_Proto } from "@repo/user-interfaces";


@Injectable()
export class TimersIntercertor implements NestInterceptor {
    constructor() {}

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const now = Date.now()

        return next.handle().pipe(
            tap(() => {console.log(`this method was completed for ${Date.now() - now}`)})
        )
    }
}


@Injectable()
export class CacheInterseptorPostPage implements NestInterceptor {

    constructor(
        private readonly cacheService: CacheService
    ) {}

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const cacheKey = `post:page:1`

        return from(this.cacheService.get(cacheKey)).pipe(
            switchMap((cached: Post_Enitity_Proto[]) => {
                if (cached) {
                    return cached.length === 0 ? of([]) : of(cached)
                }
                return next.handle()
            })
        )
    }
}