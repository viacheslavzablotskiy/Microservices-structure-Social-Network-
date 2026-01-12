import { ConnectedSocket, GatewayMetadata, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import {type Server, type Socket} from 'socket.io'
import {AuthCreationToken} from '@repo/api'
import { ChatGPRCService } from "./chat.grpc.provider";
import { Inject, UseGuards } from "@nestjs/common";
import { type RedisClientType } from "redis";
import {RedisPublishData} from '@repo/user-interfaces'
import {type DataToUpdateMessageChat, type DataToDeleteMessageChat, type SendMessageChatData} from '@repo/proto'
import { WebSocketGuard } from "src/settings/websocket-guard";

const options: GatewayMetadata = {
    namespace: 'chats',
    cors: {
        origin: 'http://localhost:5173',
        credentials: true
    },
    transports: ['websocket'],
    pingInterval: 25_000,
    pingTimeout: 20_000
}

@WebSocketGateway(options)
export class ChatSocketService implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
    @WebSocketServer()
    server: Server

    async afterInit(server: Server) {
        const sub = this.redis.duplicate()
        await sub.connect()
        /// ['chat:newMessage', 'chat:updateMessage', 'chat:deleteMessage']
        await sub.pSubscribe('chat:*', async (message: string, channel: string) => {
            try {
                const payload: RedisPublishData = JSON.parse(message)
                const roomId = await this.algorithmName({senderId: payload.message.senderId, opponentid: payload.opponentId})

                server.to(roomId).emit(channel, payload)
            } catch (error) {
                console.error('Redis parse error', error, message);
            }            

        }, )
    }

    constructor(
        private readonly authService: AuthCreationToken,
        private readonly chatGPRCService: ChatGPRCService,
        @Inject('REDIS_CLIENT_INSTANCE') private readonly redis: RedisClientType
    ) {}

    async handleConnection(client: Socket) {
        const jwtToken = client.handshake.headers.authorization?.split(' ')[1]
        if (!jwtToken) {
            client.disconnect()
            throw new WsException('You dont have token, please login')
        }
        try {
            const payload = this.authService.getDataFromRefreshToken(jwtToken)
            client.data.user = payload   
        } catch (error) {
            client.disconnect()
            throw new WsException('There is something wrrong with your token')
        }
    }

    async algorithmName(data: {senderId: number, opponentid: number}): Promise<string> {
        return [data.senderId, data.opponentid].sort().join(':')
    }

    @UseGuards(WebSocketGuard)
    @SubscribeMessage('joinChat')
    async joinToChat(@MessageBody() opponentId: number, @ConnectedSocket() client: Socket): Promise<void> {
        const uniqueName = await this.algorithmName({senderId: client.data.user.id, opponentid: opponentId})
        client.join(uniqueName)
    }

    @UseGuards(WebSocketGuard)
    @SubscribeMessage('sendMessageChat')
    async sendMessageToChat(@MessageBody() data: Omit<SendMessageChatData, 'senderId'>, @ConnectedSocket() client: Socket): Promise<void> {
        await this.chatGPRCService.sendMessageToChat({opponentId: data.opponentId, message: data.message, senderId: client.data.user.id})
    }

    @UseGuards(WebSocketGuard)
    @SubscribeMessage('updateMessageChat')
    async updateMessageChat(@MessageBody() data: Omit<DataToUpdateMessageChat, 'senderId'>, @ConnectedSocket() client: Socket): Promise<void> {
        await this.chatGPRCService.updateMessageInChat({messageId: data.messageId, senderId: client.data.user.id, message: data.message, opponentId: data.opponentId})
    }

    @UseGuards(WebSocketGuard)
    @SubscribeMessage('deleteMessageChat')
    async deleteMessageChat(@MessageBody() data: Omit<DataToDeleteMessageChat, 'senderId'>, @ConnectedSocket() client: Socket): Promise<void> {
        await this.chatGPRCService.deleteMessageInChat({messageId: data.messageId, senderId: client.data.user.id, opponentId: data.opponentId})
    }

    async handleDisconnect(client: Socket) {
        console.log(`Client: ${client.data.user} disconnect`);
            
    }

}