import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCookieAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JWTAuthGuard } from "@repo/api";
import {FileInterceptor} from '@nestjs/platform-express'
import { diskStorage } from "multer";
import { join } from "path";
import { ImageMimeTypePipe } from "src/settings/custom.images.pipe";
import { existsSync, mkdirSync, promises } from "fs";


@ApiTags('image')
@Controller('image')
export class ImageController {

    @ApiBearerAuth('auth-part')
    @ApiCookieAuth()
    @UseGuards(JWTAuthGuard)
    @ApiOperation({summary: 'loading image', description: 'load image'})
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                image: {
                    type: 'string',
                    format: 'binary'
                }
            }
        }
    })
    @Post('uplaod_image')
    @UseInterceptors(FileInterceptor('image'
        , { storage: diskStorage({
            destination: async (req, file, cb) => {
                const uploadFile = join(process.cwd(),'upload')
                console.log(join(process.cwd(), 'upload'));
                
                try {
                    await promises.mkdir(uploadFile, {recursive: true})
                    cb(null, uploadFile)
                } catch (error) {
                   cb(error, uploadFile) 
                }
            },
            filename: (req, file, cb) => {
                const filename = Date.now() + '-' + file.originalname
                cb(null, filename)
        }})

        }
    ))
    async loadingImage( @UploadedFile(new ImageMimeTypePipe()) file: Express.Multer.File 

    ): Promise<string> {return ''}
}
