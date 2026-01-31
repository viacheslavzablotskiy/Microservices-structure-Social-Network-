import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, Param, Get, Body, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCookieAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { JWTAuthGuard } from "@repo/api";
import {FileInterceptor} from '@nestjs/platform-express'
import { ImageMimeTypePipe } from "src/settings/custom.images.pipe";
import { ImageLoader } from "src/providers/image.provider";
import { TimersIntercertor } from "src/settings/main.interceptors";
import {BatchUser} from '@repo/user-interfaces'


@ApiTags('image')
@Controller('image')
export class ImageController {
    constructor(
        private readonly imageLoager: ImageLoader
    ) {}

    @ApiBearerAuth('auth-part')
    @ApiCookieAuth()
    @UseGuards(JWTAuthGuard)
    @ApiOperation({summary: 'loading image', description: 'load image'})
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        required: true,
        schema: {
            type: 'object',
            properties: {
                image: {
                    type: 'string',
                    format: 'binary'
                },
                imageUrl: {
                    type: 'string',
                    nullable: true,
                    description: 'key is empty - create new object, is not rewrite alredy existed'
                }
            }
        }
    })
    @Post('uplaodImage')
    @UseInterceptors(FileInterceptor('image'), TimersIntercertor)
    async loadingImage( @UploadedFile(new ImageMimeTypePipe()) file: Express.Multer.File,
    @Body('imageUrl') imageUrl?: string): Promise<{url: string}> {
        return this.imageLoager.loadImageInS3(file, imageUrl)
    }

    // @ApiBearerAuth('auth-part')
    // @ApiCookieAuth()
    // @UseGuards(JWTAuthGuard)
    // @ApiOperation({summary: 'get url', description: 'get valid url'})
    // @Get(':key')
    // @UseInterceptors(TimersIntercertor)
    // async getImageUrl(
    //     @Param('key') key: string
    // ): Promise<{path: string}>  {
    //     return this.imageLoager.getImageUrl(key)
    // }

    // @ApiOperation({summary: 'get data', description: 'get image and intial data for the post and comment'})
    // @ApiBearerAuth('auth-part')
    // @UseGuards(JWTAuthGuard)
    // @ApiQuery({type: String, isArray: true, required: true, description: 'array of the userIds that we need get'})
    // @UseInterceptors(TimersIntercertor)
    // @Get('batch')
    // async getBatchDataForPostAndComments(@Query('userIds') userIds: string[]): Promise<BatchUser> {
    //     const userIdsData = userIds.map(userId => Number(userId))
    //     return this.imageLoager.getBatchDataUser({userIds: userIdsData})
    // }
}