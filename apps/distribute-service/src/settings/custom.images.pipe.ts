import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";



@Injectable()
export class ImageMimeTypePipe implements PipeTransform {
    transform(file: Express.Multer.File , metadata: ArgumentMetadata) {
        const size = 100000
        if (!file) {
            throw new BadRequestException('Image is requiered')
        }

        if (!/^image\/(png|jpeg)/.test(file.mimetype)) {
            throw new BadRequestException(`This mime-type(${file.mimetype}) is not supported`)
        }

        if (size < file.size) {
            throw new BadRequestException(`File size should be less than ${size}, your is ${file.size}`)
        }
        return file
    }
}