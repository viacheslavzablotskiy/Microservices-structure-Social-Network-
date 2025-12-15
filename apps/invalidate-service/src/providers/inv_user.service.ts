import { Injectable } from "@nestjs/common";
import { CacheService } from "@repo/chache-package";


@Injectable()
export class InvalidateUserService {


     constructor(
                private readonly cacheSerivce: CacheService
    ) {}

    async delUserCache(email: string): Promise<void> {
    await this.cacheSerivce.del(`email:${email}`)
  }
}