import { CreationPostDataSchema, DeletePostDataSchema, Post_Entity, UpdatetingPostDataSchema } from "@repo/user-interfaces";
import { createZodDto } from "nestjs-zod";



export class Post_Entity_Swagger implements Post_Entity {
    id: number;
    title: string;
    imageUrl: string;
    userId: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}


export class CretionNewPostSwagger extends createZodDto(CreationPostDataSchema) {}

export class UpdationPostSwagger extends createZodDto(UpdatetingPostDataSchema) {}

export class DeletePostSwagger extends createZodDto(DeletePostDataSchema) {}