import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import {Observable, throwError} from 'rxjs'
import {status} from '@grpc/grpc-js'


@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
    catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
        const ctx = host.switchToRpc()
        const data = ctx.getData()
        const context = ctx.getContext()
        const error = exception.getError()
        
        return throwError(() => {
            return {
                code: status.INVALID_ARGUMENT,
                details: typeof error === 'string' ? error : JSON.stringify(error)
            }
        })
        
    }
}