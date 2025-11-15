import { Controller, Post, Body } from "@nestjs/common";
import {LikeMainService} from '../providers/like.service'
import {CreationLikeSchema, type CreationLikeType, DeleteLikeSchema, type DeleteLikeType} from '@repo/user-interfaces'
import { ZodValidationPipe } from "@repo/api";

@Controller()
export class MainLikeController {

    constructor(private readonly likeMainService: LikeMainService) {}

    @Post('like/create')
    async handleCreationNewLike(
        @Body(new ZodValidationPipe(CreationLikeSchema)) dto: CreationLikeType
    ): Promise<void> {
        await this.likeMainService.creationNewLike(dto)
    }

    @Post('like/delete')
    async handleDeleteLike(
        @Body(new ZodValidationPipe(DeleteLikeSchema)) dto: DeleteLikeType
    ) : Promise<void> {
        await this.likeMainService.deletingLikes(dto)
    }
}