import {ArgumentMetadata, BadRequestException, Injectable, PipeTransform} from '@nestjs/common'
import z, { ZodError, ZodType } from 'zod'

export class ZodValidationPipe<T extends ZodType<any, any, any>> implements PipeTransform {

    constructor(
        private schema: T
    ) {}

    transform(value: any, metadata: ArgumentMetadata): z.infer<T> {
        const paredValue = this.schema.safeParse(value)

        if (paredValue.success) {
            return paredValue.data
        }

        throw new BadRequestException({
            source: metadata.type,
            errors: this.formatZodErrors(paredValue.error)
        })
    }


    private formatZodErrors(error: ZodError) {
        const fieldErrors: Record<string, string[]> = {};
        const formattedData = error.format();

        for (const [key, entry] of Object.entries(formattedData) as [string, {_errors: string[]}][]) {
            if (key === '_errors') continue
            if (entry && entry._errors.length > 0) {
                fieldErrors[key] = entry._errors
            }
        }

        return fieldErrors
  }
}


// {
    // _errors: [],
    // login: { _errors: ["String must contain at least 1 character(s)"] },
    // email: { _errors: ["Invalid email"] },
    // password: { _errors: ["String must contain at least 6 character(s)"] },
    // passwordConfirm: { _errors: ["Passwords do not match"] }
    // }

    // we have this type take and give as [string, {_errors: string[]}][]