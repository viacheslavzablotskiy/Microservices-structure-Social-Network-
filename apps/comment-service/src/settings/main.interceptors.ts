import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { from, Observable, switchMap, tap, of } from "rxjs";
import {CacheService} from '@repo/chache-package'
import { CommentEnity_Proto } from "@repo/user-interfaces";
import { Request } from "express";


@Injectable()
export class CacheInterceptorPage implements NestInterceptor {
    constructor(
        private readonly cacheService: CacheService
    ) {}

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const ctx: {postId: number} = context.switchToRpc().getData()
        const key = `comments:post:${ctx.postId}:page:1`
        console.log('we already in interceptor');
        
        return from(this.cacheService.get(key)).pipe(
            switchMap((cached: CommentEnity_Proto[]) => {
                if (cached) {
                    return cached.length === 0 ? of({comments: []}) : of({comments: cached})
                }
                return next.handle()
            })
        )
    }
}


@Injectable()
export class TimerInterceptorPage implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const now = Date.now()

        return next.handle().pipe(
            tap(() => {console.log(`this method taken this time: ${Date.now() - now}`)})
        )
    }
}