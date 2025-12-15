import { Injectable } from "@nestjs/common";
import { CacheService } from "@repo/chache-package";


@Injectable()
export class InvalidateCommentService{

    constructor(
        private readonly cacheSerivce: CacheService
    ) {}


    async delCommentCountCache(postId: number): Promise<void> {
    await this.cacheSerivce.del(`postId:${postId}:comment:count`)
    }

    async delCommentPageCache(postId: number): Promise<void> {
        await this.cacheSerivce.del(`comments:post:${postId}:page:1`)
    }
}