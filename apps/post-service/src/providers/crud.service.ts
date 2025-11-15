import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PostEntity } from "src/entities/post.entity";
import {CretionNewPost, Post_Enitity_Proto} from '@repo/user-interfaces'
import { Repository } from "typeorm";
import convertFromPostToProto from "src/utils/convertToProto";
import { Empty } from "google-protobuf/google/protobuf/empty_pb";


@Injectable()
export class CrudService  {

    constructor(
        @InjectRepository(PostEntity)
        private readonly repositoryPost: Repository<PostEntity>
    ) {}

    async handleNewPost(data: CretionNewPost): Promise<Empty> {
        const creationData = this.repositoryPost.create({
            userId: data.userId,
            title: data.title,
            imageUrl: data.imageUrl,
            content: data.content
        })

        await this.repositoryPost.save(creationData)

        return new Empty()
    }

    async updatePost(data: Partial<Omit<Post_Enitity_Proto, 'createdAt' | 'updatedAt'>>): Promise<Post_Enitity_Proto> {
        const {id, ...otherData} = data

        if (!id) throw new BadRequestException('in this data we dotn convey id')

        await this.repositoryPost.update(id, otherData)

        const reponse = await this.repositoryPost.findOneBy({
            id: id
        })

        if (!reponse) throw new BadRequestException('we dont have post with that id')

        return convertFromPostToProto(reponse)

    }

    async deletePost(data: {id: number}): Promise<Empty> {
        await this.repositoryPost.delete(data.id)
        return new Empty()
    }

}