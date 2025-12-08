import { Controller, Post, Body, UseGuards, Delete, Param, Req } from "@nestjs/common";
import {LikeMainService} from '../providers/like.service'
import {CreationLikeSchema, type CreationLikeType, DeleteLikeSchema, type DeleteLikeType} from '@repo/user-interfaces'
import { JWTAuthGuard, ZodValidationPipe } from "@repo/api";
import { ApiBearerAuth, ApiBody, ApiCookieAuth, ApiNoContentResponse, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreationLikeDtoSwagger, DeleteDtoSwagger } from "src/documentation_classes/like.swagger";
import {type Request } from "express";
@ApiTags('likes')
@Controller('like')
export class MainLikeController {

    constructor(private readonly likeMainService: LikeMainService) {}

    @ApiBearerAuth('auth-part')
    @ApiCookieAuth()
    @UseGuards(JWTAuthGuard)
    @Post('create')
    @ApiOperation({summary: 'add like', description: 'creation new like'})
    @ApiBody({type: CreationLikeDtoSwagger})
    @ApiNoContentResponse({description: 'you create like successfully'})
    async handleCreationNewLike(
        @Body(new ZodValidationPipe(CreationLikeSchema)) dto: CreationLikeType
    ): Promise<void> {
        await this.likeMainService.creationNewLike(dto)
    }
    
    @ApiBearerAuth('auth-part')
    @ApiCookieAuth()
    @UseGuards(JWTAuthGuard)
    @Delete(':id')
    @ApiOperation({summary: 'cancel like', description: 'delete existing like'})
    @ApiNoContentResponse({description: 'your like succesfully deleted'})
    async handleDeleteLike(
        @Param('id') id: string, @Req() req: Request
    ) : Promise<void> {
        console.log(req.user);
        
        await this.likeMainService.deletingLikes({id: Number(id)})
    }
}