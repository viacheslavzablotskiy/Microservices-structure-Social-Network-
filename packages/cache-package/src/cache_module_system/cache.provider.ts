import { Inject, Injectable } from "@nestjs/common";
import {CACHE_MANAGER} from '@nestjs/cache-manager'
import { Cache } from "cache-manager";

type CacheEntry<T> = { key: string; value: T; ttl?: number };

@Injectable()
export class CacheService {
    constructor(
        @Inject(CACHE_MANAGER) private cache: Cache
    ) {}

    async set<T>(key: string, value: T, ttl = 60_000): Promise<void> {
        await this.cache.set(key, value, ttl)
    }

    async get<T>(key: string): Promise<T | undefined> {
        return await this.cache.get<T>(key)
    }

    async del(key: string): Promise<void> {
        await this.cache.del(key)
    }

    async clear(): Promise<boolean> {
        await this.cache.clear()
        return true;
    }

    async mdel(data: string[]): Promise<void> {
        await this.cache.mdel(data)
    }

    async mget<T>(data: string[]): Promise<(T | null)[]> {
        return await this.cache.mget(data)
    }

    async mset<T>(data: CacheEntry<T>[]): Promise<void> {
        await this.cache.mset(data)
    }

    async disconnect(): Promise<void> {
        return await this.cache.disconnect()
    }


}