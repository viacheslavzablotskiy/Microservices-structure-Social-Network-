import { CreationLikeSchema, DeleteLikeSchema } from "@repo/user-interfaces";
import { createZodDto } from "nestjs-zod";


export class CreationLikeDtoSwagger extends createZodDto(CreationLikeSchema){}

export class DeleteDtoSwagger extends createZodDto(DeleteLikeSchema) {}