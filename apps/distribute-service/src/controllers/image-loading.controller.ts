import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, Param, Get, Body } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCookieAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JWTAuthGuard } from "@repo/api";
import {FileInterceptor} from '@nestjs/platform-express'
import { diskStorage } from "multer";
import { join } from "path";
import { ImageMimeTypePipe } from "src/settings/custom.images.pipe";
import { existsSync, mkdirSync, promises } from "fs";
import { ImageLoader } from "src/providers/image.provider";
import { TimersIntercertor } from "src/settings/main.interceptors";


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
                key: {
                    type: 'string',
                    nullable: true,
                    description: 'key is empty - create new object, is not rewrite alredy existed'
                }
            }
        }
    })
    @Post('uplaod_image')
    @UseInterceptors(FileInterceptor('image'), TimersIntercertor)
    async loadingImage( @UploadedFile(new ImageMimeTypePipe()) file: Express.Multer.File,
    @Body('key') key?: string): Promise<{key: string}> {
        return this.imageLoager.loadImageInS3(file, key)
    }

    @ApiBearerAuth('auth-part')
    @ApiCookieAuth()
    @UseGuards(JWTAuthGuard)
    @ApiOperation({summary: 'get url', description: 'get valid url'})
    @Get(':key')
    @UseInterceptors(TimersIntercertor)
    async getImageUrl(
        @Param('key') key: string
    ): Promise<{path: string}>  {
        return this.imageLoager.getImageUrl(key)
    }
}

// if we want to work namely with the disk on my computer
    // @UseInterceptors(FileInterceptor('image'
    //     , { storage: diskStorage({
    //         destination: async (req, file, cb) => {
    //             const uploadFile = join(process.cwd(),'upload')
    //             console.log(join(process.cwd(), 'upload'));
                
    //             try {
    //                 await promises.mkdir(uploadFile, {recursive: true})
    //                 cb(null, uploadFile)
    //             } catch (error) {
    //                cb(error, uploadFile) 
    //             }
    //         },
    //         filename: (req, file, cb) => {
    //             const filename = Date.now() + '-' + file.originalname
    //             cb(null, filename)
    //     }})

    //     }
    // ))