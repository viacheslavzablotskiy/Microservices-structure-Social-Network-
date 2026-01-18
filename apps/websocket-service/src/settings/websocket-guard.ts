import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import {AuthCreationToken} from '@repo/api'
import {type Socket} from 'socket.io'
import { WsException } from "@nestjs/websockets";


export interface UserData  {
    userId: number,
    login: string
}

function verifyUserData(client: any): client is UserData {
    return client && typeof client.userId === 'number' && typeof client.login === 'string'
}

@Injectable()
export class WebSocketGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToWs()
        const client = request.getClient<Socket>()
        const user = client.data.user
        if (!verifyUserData(user)) { 
            throw new WsException('Unauthorized')
        }

        return true
    }
}
