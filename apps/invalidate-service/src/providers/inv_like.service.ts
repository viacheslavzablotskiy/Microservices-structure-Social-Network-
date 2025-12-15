import { Injectable } from "@nestjs/common";

import { CacheService } from "@repo/chache-package";



@Injectable()
export class InvalidateLikeService {

    constructor(
            private readonly cacheSerivce: CacheService
    ) {}

    async delLikeCountCache(postId: number): Promise<void> {
    await this.cacheSerivce.del( `postId:${postId}:like:count`)
  }
}