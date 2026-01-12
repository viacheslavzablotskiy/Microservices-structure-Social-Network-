import { Inject, Injectable, UseGuards } from '@nestjs/common';
import { ConnectedSocket, GatewayMetadata, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException} from '@nestjs/websockets';
import {type Server, type Socket} from 'socket.io'
import {AuthCreationToken} from '@repo/api'
import {type RedisClientType} from 'redis'
import { WebSocketGuard } from 'src/settings/websocket-guard';


const options: GatewayMetadata = {
  namespace: 'chat',
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  },
  transports: ['websocket'],
  pingInterval: 25_000,
  pingTimeout: 20_000
}

@WebSocketGateway(options)
@Injectable()
export class GroupSerivce implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect{
    @WebSocketServer()
    server: Server

    async afterInit(server: any) {
        const sub = this.redisInstance.duplicate()
        await sub.connect()

        await sub.pSubscribe(['group:member:*', 'group:message:*'], (message: string, channel: string) => {
            switch (channel) {
              case '': {

              }
              case '': {

              }
            }
        })
    }

    async handleConnection(client: Socket) {
        const jwtToken = client.handshake.headers.authorization?.split(' ')[1]
        if (!jwtToken) {
          client.disconnect()
          throw new WsException('You are not authorizated')
        }
        try {
          const payload = this.authSerivce.getDataFromRefreshToken(jwtToken)
          client.data.user = payload
        } catch (error) {
          console.error(error);
          client.disconnect()
          throw new WsException('Something goes wrong')
        }
    }

    constructor (
      private readonly groupGrpsService: GroupSerivce,
      private readonly authSerivce: AuthCreationToken,
      @Inject('REDIS_CLIENT_INSTANCE') private readonly redisInstance: RedisClientType
    ) {}
    // -----------------------------------------------------------------------
    @UseGuards(WebSocketGuard)
    @SubscribeMessage('joinRoom')
    async hadndleJoinRoom(@MessageBody() data: {roomId: string}, @ConnectedSocket() client: Socket): Promise<void> {
      client.join(data.roomId)
      this.server.in(data.roomId).emit('enterance', `user ${client.data.user.login} connected to the group`)
    }

    @UseGuards(WebSocketGuard)
    @SubscribeMessage('leaveRoom')
    async handleLeaveRoom(@MessageBody() data: {roomId: string}, @ConnectedSocket() client: Socket): Promise<void> {
      client.leave(data.roomId)
      this.server.in(data.roomId).emit('leaving', `user ${client.data.user.login} leave the group`)
    }
    //-------------------------------------------------------------------------


    //---------------------------------------------------------------------------

    @UseGuards(WebSocketGuard)
    @SubscribeMessage('createNewGroup')
    async handleCreateNewGroup() {}

    @UseGuards(WebSocketGuard)
    @SubscribeMessage('addNewMember')
    async handleNewMember() {}

    async handleDisconnect(client: Socket) {
      console.log(`Client ${client.data.user} disconnected`);
    }
 
 }
