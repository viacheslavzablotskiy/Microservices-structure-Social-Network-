import { ArgumentsHost, Catch, ExceptionFilter, Injectable } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import {type Socket} from 'socket.io'

@Catch(WsException)
@Injectable()
export class WsExceptionFilter implements ExceptionFilter {
    catch(exception: WsException, host: ArgumentsHost) {
        const ctx = host.switchToWs()
        const client = ctx.getClient<Socket>()

        const error = exception.getError()
        const response = typeof error === 'string' ? {message: error} : error


        client.emit('error', response)
    }
}