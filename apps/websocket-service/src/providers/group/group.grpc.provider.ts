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


    async newGroup(data: {roomName: string, authorId: number}): Promise<void> {
        try {
            const roomId = uuidv4()
            const body: CreateNewGroupType = {...data, roomId: roomId}
            await firstValueFrom(this.groupWebsocketService.createNewGroup(body))   
        } catch (error) {
            console.error(error)
            throw new WsException('creation the room and group was failed')
        }  
    }

    async newMember(data: NewMemberType): Promise<void> {
        try {
            await firstValueFrom(this.groupWebsocketService.addNewMember(data))   
        } catch (error) {
            console.error(error)
            throw new WsException('Could not add new member')
        }
    }

    async deleteMember(data: DeleteMemberType): Promise<void> {
        try {
            await firstValueFrom(this.groupWebsocketService.deleteMember(data))   
        } catch (error) {
            console.error(error)
            throw new WsException(`Could not delete this member ${data.memberId}`)
        }  
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