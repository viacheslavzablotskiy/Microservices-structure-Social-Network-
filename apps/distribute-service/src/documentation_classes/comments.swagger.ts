import { CommentEntity, CreationCommentSchema, DeleteCommentSchema, UpdatingCommentSchema } from "@repo/user-interfaces";
import { createZodDto } from "nestjs-zod";


export class CommentEntitySwagger implements CommentEntity {
    id: number;
    userId: number;
    postId: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export class CreatioNcommentSwagger extends createZodDto(CreationCommentSchema) {}

export class UpdationCommentSwagger extends createZodDto(UpdatingCommentSchema) {}

export class DeleteCommentSwagger extends createZodDto(DeleteCommentSchema) {}