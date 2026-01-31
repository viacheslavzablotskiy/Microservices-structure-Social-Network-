import { HttpException, HttpStatus, Inject, Injectable, NotAcceptableException, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import {CacheService} from '@repo/chache-package'
import {ConfigService} from '@nestjs/config'
import {S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand} from '@aws-sdk/client-s3'
import {getSignedUrl} from '@aws-sdk/s3-request-presigner'
import { type ClientGrpc } from "@nestjs/microservices";
import { BatchDataPorto, type DistUserService } from "@repo/proto";
import { BatchUser } from "@repo/user-interfaces";
import { firstValueFrom } from "rxjs";

@Injectable()
export class ImageLoader implements OnModuleInit{
    private s3Client: S3Client
    private distUserService: DistUserService

    constructor(
        private readonly cacheService: CacheService,
        private readonly configSerivce: ConfigService,
        @Inject('DIST-USER-PATH') private readonly client: ClientGrpc
    ) {}

    onModuleInit() {
        this.s3Client = new S3Client({
            region: this.configSerivce.get<string>('AWS_REGION') || '',
            credentials: {
                accessKeyId: this.configSerivce.get<string>('AWS_ACCESS_KEY_ID') || '',
                secretAccessKey: this.configSerivce.get<string>('AWS_SECRET_ACCESS_KEY') || ''
            }
        })

        this.distUserService = this.client.getService<DistUserService>('DistUserService')
    }

   extractKeyFromUrl(url: string) {
    const part = url.split('.amazonaws.com/')
    if (part.length < 2) {
        throw new HttpException('S3 url invalid', HttpStatus.BAD_REQUEST)
    }
    return part[1]
   }

    // create new object with the new key or updated already created object with existing key
    async loadImageInS3(file: Express.Multer.File, imageUrl?: string): Promise<{url: string}> {
        const region = this.configSerivce.get<string>('AWS_REGION') || ''
        const bucketName = this.configSerivce.get<string>('BUCKET_NAME') || ''
        let objectKey = `${Date.now()}-${file.originalname}`
        if (imageUrl) objectKey = this.extractKeyFromUrl(imageUrl)

        await this.s3Client.send(
            new PutObjectCommand({
                Bucket: bucketName,
                Key: objectKey,
                Body: file.buffer,
                ContentType: file.mimetype
            })
        )

        const url = `https://${bucketName}.s3.${region}.amazonaws.com/${objectKey}`;
        return {url: url}
    }

    async deleteImage(key: string): Promise<{deleted: boolean}> {
    const bucketName = this.configSerivce.get<string>('BUCKET_NAME') || ''
    if (!bucketName) throw new NotAcceptableException('there is not bucket with that name')

    try {
        await this.s3Client.send(new HeadObjectCommand({Key: key, Bucket: bucketName}))
    } catch (error) {
        if (error.name === 'Not Found' || error.$metadata?.HttpStatus === 404) {
            throw new NotAcceptableException(`Object with this key: ${key} does not exists`)
        }
        throw new Error(error)
    }

    await this.s3Client.send(new DeleteObjectCommand({Key: key, Bucket: bucketName}))

    await this.cacheService.del(key)

    return {deleted: true}
    }


    // async getImageUrl(key: string): Promise<{path: string}> {
    //     const bucketName = this.configSerivce.get<string>('BUCKET_NAME') || ''
    //     if (!bucketName) throw new HttpException('Invalid bucket name', HttpStatus.NOT_ACCEPTABLE)
    //     const cached: string | undefined = await this.cacheService.get(key)
    //     if (cached) return {path: cached}
        
    //     const command = new GetObjectCommand({
    //         Bucket: bucketName,
    //         Key: key,
    //     })
    //     const signedUrl = await getSignedUrl(this.s3Client, command, {expiresIn: 420})

    //     await this.cacheService.set(key, signedUrl, 420_000)
    //     return {path: signedUrl}
    // }

    // async getBatchDataUser(data: {userIds: number[]}): Promise<BatchUser> {
    //     const ttl = 42 * 60 * 1000
    //     const now = Date.now()
    //     const batchUserData: BatchDataPorto =  await firstValueFrom(this.distUserService.getBatchData(data.userIds))


    //     const entries: [string, BatchUser[string]][] = await Promise.all(
    //         Object.entries(batchUserData).map(async ([key, value]): Promise<[string, BatchUser[string]]> => {
    //             const imageUrl = await this.getImageUrl(value.avatarKey)
    //             const result: [string, BatchUser[string]] = [
    //                 key, {
    //                     id: value.id,
    //                     avatarUrl: imageUrl.path,
    //                     login: value.login,
    //                     expiredAt: new Date(now + ttl)  
    //                 } 
    //             ]
    //             return result
    //         })
    //     )


    //     const result: BatchUser = Object.fromEntries(entries)
    //     return result
    // }
 
    // async getImageBuffer(key: string): Promise<{image: Buffer}> {
    //     const bucketName = this.configSerivce.get<string>('BUCKET_NAME') || '' 
    //     const response = await this.s3Client.send(new GetObjectCommand({Key: key, Bucket: bucketName}))
    //     const chunks: Buffer[] = []
    //     for await (const chunk of response.Body as any) {
    //         chunks.push(chunk as Buffer)
    //     }
    //     const buffer = Buffer.concat(chunks)
    //     return {image: buffer}
    // }

    // async getImageBuffer(key: string): Promise<{image: Buffer}> {
    //     const bucketName = this.configSerivce.get<string>('BUCKET_NAME') || ''
    //     const response = (await this.s3Client.send(new GetObjectCommand({Key: key, Bucket: bucketName}))).Body as NodeJS.ReadableStream
    //     if (!response) throw new NotAcceptableException('You dont have this image')
        
    //     return new Promise((resolve, reject) => {
    //         const chunks: Buffer[] = [];

    //         response.on('data', (chunk) => chunks.push(chunk))
    //         response.on('end', () => resolve({image: Buffer.concat(chunks)}))
    //         response.on('error', error => reject(error))
    //     })
    // }

}