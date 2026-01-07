import { Injectable } from '@nestjs/common';
import { ConnectedSocket, GatewayMetadata, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException} from '@nestjs/websockets';
import {type Server, type Socket} from 'socket.io'
import { RedisPublishChat } from './publish.provider';

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
export class ScoketService {
    @WebSocketServer()
    server: Server

    constructor (
      private readonly publichService: RedisPublishChat
    ) {}
    //// aglorithm of the room is push all id to [] sort join (:)

    @SubscribeMessage('joinRoom')
    async hadndleJoinRoom(@MessageBody() {room, user}: any, @ConnectedSocket() client: Socket): Promise<void> {
      client.join(room)
      this.server.in(room).emit('enterance', `user ${user} connected to the room ${room}`)
    }

    @SubscribeMessage('leaveRoom')
    async handleLeaveRoom(@MessageBody() {room, user}: any, @ConnectedSocket() client: Socket): Promise<void> {
      client.leave(room)
      this.server.in(room).emit('leaving', `user ${user} leave the room ${room}`)
    }
 
    @SubscribeMessage('createNewMessage')
    async createNewMessage(@MessageBody() body: any): Promise<void> {
      const response = await this.publichService.createNewMessage(body)
      this.server.in('room').emit('chat', response)
    }
    

    @SubscribeMessage('updateMessage')
    async updateMessage(@MessageBody() body: any): Promise<void> {
      const response = await this.publichService.updateMessage(body)
      this.server.in('room').emit('chat', response)
    }

    @SubscribeMessage('deleteMessage')
    async deleteMessage(@MessageBody() body: any): Promise<void> {
      try {
        await this.publichService.deleteMessage(body)
        this.server.in('room').emit('chat', {deleted: true})
      } catch (error) {
        throw new WsException('yuor data is not valid')
      }
    }
 }
