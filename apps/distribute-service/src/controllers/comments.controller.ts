import { Controller, Query, Get, BadRequestException, Param, Body, Post, UseGuards, Delete, Patch } from "@nestjs/common";
import {MainCommentService} from '../providers/comment.service'
import { JWTAuthGuard, ZodValidationPipe } from "@repo/api";
import {CreationCommentSchema, type CreationCommentType, UpdatingCommentSchema,
     type UpdatingCommentType, DeleteCommentSchema, type DeleteCommentType,
     CommentEntity} from '@repo/user-interfaces'
import { ApiBearerAuth, ApiBody, ApiCookieAuth, ApiNoContentResponse, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CommentEntitySwagger, CreatioNcommentSwagger, DeleteCommentSwagger, UpdationCommentSwagger } from "src/documentation_classes/comments.swagger";
import { UpdationPostSwagger } from "src/documentation_classes/post.swagger";

@ApiTags('comments')
@Controller('comments')
export class MainCommentController {

    constructor(private readonly commentService: MainCommentService) {}

    @ApiBearerAuth('auth-part')
    @ApiCookieAuth()
    @UseGuards(JWTAuthGuard)
    @Get(':postId')
    @ApiOperation({summary: 'get comments', description: 'get protion of the comment'})
    @ApiQuery({name: 'after', type: String, required: false, description: 'what last id'})
    @ApiResponse({type: CommentEntitySwagger, isArray: true, description: 'your answer'})
    async handleLoadMoreComments(
        @Query('after') after?: string,
        @Param('postId') postId?: string,
    ) : Promise<CommentEntity[]> {
        if (!after && !postId) throw new BadRequestException('error, because we dont have initialComments')
        if (!after) {
            return await this.commentService.getInitialCommentData({postId: Number(postId)})
        }
        return await this.commentService.getOtherPartOfData({lastId: Number(after), postId: Number(postId)})    ///There on the client side
    } 
                                                                                                                ///dispatch nextCursor
    @ApiBearerAuth('auth-part')
    @ApiCookieAuth()
    @UseGuards(JWTAuthGuard)                                                                                                            
    @Post('create')
    @ApiOperation({summary: 'creation new comment', description: 'creation new comment'})
    @ApiBody({type: CreatioNcommentSwagger})
    @ApiNoContentResponse({description: 'you created comment successfully'})
    async hadleCreateNewComent(
        @Body(new ZodValidationPipe(CreationCommentSchema)) dto: CreationCommentType
    ) : Promise<void> {
        await this.commentService.creationNewComment(dto)
    }

    @ApiBearerAuth('auth-part')
    @ApiCookieAuth()
    @UseGuards(JWTAuthGuard)
    @Patch(':id')
    @ApiOperation({summary: 'updation comments', description: 'update your comment'})
    @ApiBody({type: UpdationCommentSwagger})
    @ApiNoContentResponse({description: 'you update your comment successfully'})
    async handleUpdateComment(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(UpdatingCommentSchema)) dto: UpdatingCommentType
    ): Promise<void> {
        await this.commentService.updationNewComment({content: dto.content, id: Number(id)})
    }

    @ApiBearerAuth('auth-part')
    @ApiCookieAuth()
    @UseGuards(JWTAuthGuard)
    @Delete(":id")
    @ApiOperation({summary: 'delete comments', description: 'delete your comment'})
    @ApiQuery({name: 'postId', type: String, required: true, description: 'for double validation'})
    @ApiNoContentResponse({description: 'you delete your comment successfully'})
    async handleDeleteComment(
    @Param('id') id: string,
    @Query('postId') postId: number
    ) : Promise<void> {
        console.log(Number(id));
        
        await this.commentService.deleteComment({postId: Number(postId), id: Number(id)})
    }
}
