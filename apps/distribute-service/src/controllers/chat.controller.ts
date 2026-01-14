import { Body, Controller, Injectable, Patch, Post, Req, Res, UnauthorizedException, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JWTAuthGuard } from "@repo/api";
import { TimersIntercertor } from "src/settings/main.interceptors";
import {type Request} from 'express'

@ApiTags('group')
@Controller('chat')
export class ChatController {

    @ApiCookieAuth()
    @ApiBearerAuth('auth-part')
    @ApiOperation({summary: 'create new group', description: 'crate new group'})
   // @ApiBody({type: })
    @ApiResponse({status: 201, description: 'group was created successfully'})
    @UseGuards(JWTAuthGuard)
    @Post('createNewGroup')
    @UseInterceptors(TimersIntercertor)
    async handleNewGroup(@Req() req: Request, @Body() data: {roomName: string}): Promise<void> {
        if (!req.user) throw new UnauthorizedException('you are not authorizated')
        const authorId = req.user?.userId
    }   


    @ApiBearerAuth('auth-part')
    @ApiCookieAuth()
    @ApiOperation({summary: 'added member', description: 'added some member from some group'})
    @ApiResponse({status: 203, description: 'adding user was successfully completed'})
    @UseGuards(JWTAuthGuard)
    @UseInterceptors(TimersIntercertor)
    @Patch('addNewMember/:userId')
    async handleAddNewMember(@Req() req: Request): Promise<void> {
        if (!req.user) throw new UnauthorizedException('you are not authorizated')
    }

    @ApiBearerAuth('auth-part')
    @ApiCookieAuth()
    @ApiOperation({summary: 'delete member', description: 'delete some member from some group'})
    @ApiResponse({status: 204, description: 'deliting user was successfully completed'})
    @UseGuards(JWTAuthGuard)
    @UseInterceptors(TimersIntercertor)
    @Patch('deleteMember/:userId')
    async handleDeleteMember(@Req() req: Request): Promise<void> {
        if (!req.user) throw new UnauthorizedException('you are not authorizated')
    }


}