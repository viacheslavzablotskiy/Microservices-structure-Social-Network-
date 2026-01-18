import { Request } from "express";
import { promises } from "fs";
import { StorageEngine } from "multer";
import {CacheService} from '@repo/chache-package'
import { createHash } from "crypto";
import { join } from "path";


export class HashStorage implements StorageEngine {
    private uploadPath: string

    constructor(
        uploadPath: string,
        private readonly cacheService: CacheService
    ) {
        this.uploadPath = uploadPath
    }

    async _handleFile(req: Request, file: Express.Multer.File, callback: (error?: any, info?: any) => void) {
        try {
            await promises.mkdir(this.uploadPath, {recursive: true})

            const chunks: Buffer[] = []
            file.stream.on('data', chunk => chunks.push(chunk))
            file.stream.on('end', async () => {
                const buffer = Buffer.concat(chunks)
                const hash = createHash('sha256').update(buffer).digest('hex')

                const isExisting = await this.cacheService.get(hash)
                if (isExisting) {
                    return callback(null, {
                        path: isExisting,
                        reused: true
                    })
                }

                const filename = Date.now() + '-' + file.originalname
                const fullpath = join(this.uploadPath, filename)

                await promises.writeFile(fullpath, buffer)

                await this.cacheService.set(hash, fullpath)

                callback(null, {
                    path:fullpath,
                    size: file.size,
                    reused: false
                })

                file.stream.on('error', (err: any) => callback(err))
            })

        } catch (error) {   
            callback(error)
        }   
    }

    async _removeFile(req: Request, file: Express.Multer.File, callback: (error: Error | null) => void) {
        try {
            if (file.path) {
                await promises.unlink(file.path)
            }
        } catch (error) {
            callback(error)
        }
    }
}