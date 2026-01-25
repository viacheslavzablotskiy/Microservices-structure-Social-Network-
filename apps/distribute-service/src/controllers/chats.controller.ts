import { Controller, Get, Param, Query, Req, UnauthorizedException, UseFilters, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JWTAuthGuard } from "@repo/api";
import { MainChatService } from "src/providers/chat.service";
import { TimersIntercertor } from "src/settings/main.interceptors";
import {type Request} from 'express'
import { MessageEntity } from "@repo/user-interfaces";

@ApiTags('chat')
@Controller('chats')
export class MainChatController {
    constructor(
        private readonly mainChatService: MainChatService
    ) {}

    @ApiBearerAuth('auth-part')
    @ApiCookieAuth()
    @ApiOperation({summary: 'get messages', description: 'get first messages or other messages'})
    @ApiResponse({status: 200, description: 'you succesfully get your messages'})
    @ApiParam({name: 'chatId', type: String, required: true, description: 'id of the chat'})
    @ApiQuery({name: 'lastId', type: String, required: false, description: 'from what messageId i should start'})
    @UseGuards(JWTAuthGuard)
    @UseInterceptors(TimersIntercertor)
    @Get(':chatId/messages')
    async getFirstMessagesOrOther(@Req() req: Request, @Param('chatId') chatId: string, @Query('lastId') lastId: string): Promise<MessageEntity[]> {
        if (req.user) throw new UnauthorizedException('you are not authorizate')
        if (!lastId) {
            return await this.mainChatService.getChatFirstMessages({chatId: chatId})
        }
        return await this.mainChatService.getChatOtherMessages({chatId: chatId, lastId: lastId})
    }
}