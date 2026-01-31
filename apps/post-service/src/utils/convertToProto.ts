import {convertDateToTimeStamp} from '@repo/proto'
import { PostEntity } from 'src/entities/post.entity'
import { Post_Enitity_Proto } from '@repo/user-interfaces'

export const convertFromPostToProto = (data: PostEntity): Omit<Post_Enitity_Proto, 'userData'> => {
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      userId: data.userId,
      imageUrl: data.imageUrl,
      createdAt: convertDateToTimeStamp(data.createdAt),
      updatedAt: convertDateToTimeStamp(data.updatedAt)
    }
  }


export default convertFromPostToProto