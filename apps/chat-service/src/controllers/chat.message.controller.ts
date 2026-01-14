import { Controller, Get } from '@nestjs/common';
import { ChatService } from '../providers/chat.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import {type SendMessageChatData, type DataToDeleteMessageChat, type DataToUpdateMessageChat} from '@repo/proto'

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @GrpcMethod('WebscoketChatService', 'SendMessageChat')
  async newMessage(data: SendMessageChatData): Promise<void>  {
      try {
        await this.chatService.createNewMessageAndNewRoom(data)
      } catch (error) {
        if (error instanceof RpcException) {
          throw new RpcException(error.getError())
        }
        throw new Error(error)
      }
  }

  @GrpcMethod('WebscoketChatService', 'UpdateMessageChat')
  async updateMessage(data: DataToUpdateMessageChat): Promise<void> {
    try {
      await this.chatService.updateMessageChat(data)
    } catch (error) {
      if (error instanceof RpcException) {
        throw new RpcException(error.getError())
      }
      throw new Error(error)
    }
  }

  @GrpcMethod('WebscoketChatService', 'DeleteMessageChat')
  async deletedMessage(data: DataToDeleteMessageChat): Promise<void> {
    try {
      await this.chatService.deleteMessageChat(data)
    } catch (error) {
      if (error instanceof RpcException) {
        throw new RpcException(error.getError())
      }
    }
  }
}
