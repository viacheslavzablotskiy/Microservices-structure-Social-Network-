import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";



@Injectable()
export class WebSocketInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const now = Date.now()

        return next.handle().pipe(
            tap(() => {console.log(`this method take ${Date.now() - now}`)})
        )
    }
}