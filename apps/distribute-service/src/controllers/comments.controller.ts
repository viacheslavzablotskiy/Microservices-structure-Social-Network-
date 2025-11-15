import { Controller, Query, Get, BadRequestException, Param, Body, Post } from "@nestjs/common";
import {MainCommentService} from '../providers/comment.service'
import { ZodValidationPipe } from "@repo/api";
import {CreationCommentSchema, type CreationCommentType, UpdatingCommentSchema,
     type UpdatingCommentType, DeleteCommentSchema, type DeleteCommentType,
     CommentEntity} from '@repo/user-interfaces'


@Controller('comments')
export class MainCommentController {

    constructor(private readonly commentService: MainCommentService) {}

    @Get(':postId')
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
    @Post('create')
    async hadleCreateNewComent(
        @Body(new ZodValidationPipe(CreationCommentSchema)) dto: CreationCommentType
    ) : Promise<void> {
        await this.commentService.creationNewComment(dto)
    }

    @Post('create')
    async handleUpdateComment(
        @Body(new ZodValidationPipe(UpdatingCommentSchema)) dto: UpdatingCommentType
    ): Promise<void> {
        await this.commentService.updationNewComment(dto)
    }

    @Post('delete')
    async handleDeleteComment(
     @Body(new ZodValidationPipe(DeleteCommentSchema)) dto: DeleteCommentType
    ) : Promise<void> {
        await this.commentService.deleteComment(dto)
    }
}
