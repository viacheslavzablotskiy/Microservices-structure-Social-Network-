import { Controller, Post, Get, Query, Body} from "@nestjs/common";
import {MainPostService} from '../providers/post.service'
import { ZodValidationPipe } from "@repo/api";
import {CreationPostDataSchema, type CreationPostDataType, UpdatetingPostDataSchema,
     type UpdatePostDataType, DeletePostDataSchema, type DeletePostDataType} from '@repo/user-interfaces'


@Controller('post')
export class MainPostCOntriller {
    
    constructor(private readonly postService: MainPostService) {}

    @Get()
    async getInitialOrSomeData(
        @Query('after') after?: string
    ) {
        if (!after) {
            return await this.postService.getInitialPostsData()
        } 
        else {
            return await this.postService.getOtherPartOfData({lastId: Number(after)})
        }
    }


    @Post('create')
    async handleCreateNewPost(
        @Body(new ZodValidationPipe(CreationPostDataSchema)) dto: CreationPostDataType
    ) : Promise<void> {
        await this.postService.creationNewPost(dto)
    }

    @Post('update')
    async handleUpdatePost(
        @Body(new ZodValidationPipe(UpdatetingPostDataSchema)) dto: UpdatePostDataType
    ): Promise<void> {
        await this.postService.updatePost(dto)
    }

    @Post('delete') ////there need RABBITMQ
    async handleDeletePost(
        @Body(new ZodValidationPipe(DeletePostDataSchema)) dto: DeletePostDataType
    ) : Promise<void> {
        await this.postService.deletePost(dto)
    }
}