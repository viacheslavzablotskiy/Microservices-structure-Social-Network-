import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import {v4 as uuidv4} from 'uuid'
import {WebSocketGroupService, CreateNewGroupType, NewMemberType, DeleteMemberType, CreateNewMesageInGroupType, UpdataMessageInGroupType, DeleteMessageInGroupType} from '@repo/proto'
import { type ClientGrpc } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { WsException } from "@nestjs/websockets";


@Injectable()
export class GroupGRPSService implements OnModuleInit {
    private groupWebsocketService: WebSocketGroupService
    
    constructor(
        @Inject('WEBSCOKET-GROUP-PATH') private readonly client: ClientGrpc
    ){}

    onModuleInit() {
        this.groupWebsocketService = this.client.getService<WebSocketGroupService>('WebSocketGroupService')
    }

    async addNewMessageGroup(data: CreateNewMesageInGroupType): Promise<void> {
        try {
            await firstValueFrom(this.groupWebsocketService.createNewMessageGroup(data))   
        } catch (error) {
            console.error(error)
            throw new WsException('Could not add new message')
        }
    }

    async updateMessageGroup(data: UpdataMessageInGroupType): Promise<void> {
        try {
            await firstValueFrom(this.groupWebsocketService.updateMessageGroup(data))   
        } catch (error) {
            console.error(error)
            throw new WsException('Could update this message')
        }
    }

    async deleteMessageGroup(data: DeleteMessageInGroupType): Promise<void> {
        try {
            await firstValueFrom(this.groupWebsocketService.deleteMessageGroup(data))   
        } catch (error) {
            console.error(error)
            throw new WsException('Could not deleteMessage')
        }
    }
}