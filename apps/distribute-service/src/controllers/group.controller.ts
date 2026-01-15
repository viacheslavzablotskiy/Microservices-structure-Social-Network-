import { Body, Controller, Delete, Get, Injectable, Param, Patch, Post, Query, Req, Res, UnauthorizedException, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JWTAuthGuard, ZodValidationPipe } from "@repo/api";
import { TimersIntercertor } from "src/settings/main.interceptors";
import {type Request} from 'express'
import {CreateNewGroupSwagger, AddNewMemberSwagger, DeleteMemberSwagger} from '../documentation_classes/group.swagger'
import { NotificationTypeDataForClient, RoomDocument, RoomTypeData, createNewGroupSchema, addNewMemberGroupSchema,
     deleteMemberGroupSchema, type CreateNewGroupType, type AddNewMemberGroup, type DeleteMmemberGroup } from "@repo/user-interfaces";
import { MainGrudGroupService } from "src/providers/group.service";

@ApiTags('group')
@Controller('group')
export class ChatController {

    constructor(
        private readonly maingroupService: MainGrudGroupService
    ) {}


    @ApiBearerAuth('auth-part')
    @ApiCookieAuth()
    @ApiOperation({summary: 'get the messages', description: 'get only first 30 messages + notificaitons or other messags and notifications'})
    @ApiResponse({status: 200, description: 'there your data'})
    @UseGuards(JWTAuthGuard)
    @UseInterceptors(TimersIntercertor)
    @Get(':roomId/messages')
    async initialSetMessageOrOtherData(
        @Req() req: Request, @Param('roomId') roomId: string, @Query('after') after: string   // Date
    ): Promise<void> {

    }


    @ApiCookieAuth()
    @ApiBearerAuth('auth-part')
    @ApiOperation({summary: 'create new group', description: 'crate new group'})
   @ApiBody({type: CreateNewGroupSwagger})
    @ApiResponse({status: 201, description: 'group was created successfully'})
    @UseGuards(JWTAuthGuard)
    @Post('createNewGroup')
    @UseInterceptors(TimersIntercertor)
    async handleNewGroup(@Req() req: Request, @Body(new ZodValidationPipe(createNewGroupSchema)) data: CreateNewGroupType): Promise<RoomDocument> {
        if (!req.user) throw new UnauthorizedException('you are not authorizated')
        const authorId = req.user.userId
        return await this.maingroupService.createNewGroup({authorId: authorId, roomName: data.roomName})
    }   


    @ApiBearerAuth('auth-part')
    @ApiCookieAuth()
    @ApiOperation({summary: 'added member', description: 'added some member from some group'})
    @ApiResponse({status: 203, description: 'adding user was successfully completed'})
    @UseGuards(JWTAuthGuard)
    @ApiBody({type: AddNewMemberSwagger})
    @UseInterceptors(TimersIntercertor)
    @Patch(':roomId/members/:userId')
    async handleAddNewMember(
        @Req() req: Request, @Param('roomId') roomId: string, @Param('userId') userId: string, //memberId 
    @Body(new ZodValidationPipe(addNewMemberGroupSchema)) dto: AddNewMemberGroup): Promise<NotificationTypeDataForClient> {
        if (!req.user) throw new UnauthorizedException('you are not authorizated')
        const authorId = req.user.userId
        return await this.maingroupService.addNewMember({authorId: authorId, roomName: dto.roomName, memberId: Number(roomId)})
    }

    @ApiBearerAuth('auth-part')
    @ApiCookieAuth()
    @ApiOperation({summary: 'delete member', description: 'delete some member from some group'})
    @ApiResponse({status: 204, description: 'deliting user was successfully completed'})
    @UseGuards(JWTAuthGuard)
    @ApiBody({type: DeleteMemberSwagger})
    @UseInterceptors(TimersIntercertor)
    @Delete(':roomId/members/:userId')
    async handleDeleteMember(
        @Req() req: Request, @Param('roomId') roomId: string, @Param('userId') userId: string, //memberId
        @Body(new ZodValidationPipe(deleteMemberGroupSchema)) dto: DeleteMmemberGroup
    ): Promise<NotificationTypeDataForClient> {
        if (!req.user) throw new UnauthorizedException('you are not authorizated')
        const authorId = req.user.userId
        return await this.maingroupService.deleteMember({authorId: authorId, roomName: dto.roomName, memberId: Number(userId)})
    }


}