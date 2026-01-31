import { TimeStamp } from "@repo/static-data";


export interface Post_Entity {
    id: number,
    userId: number,
    title: string,
    content: string,
    imageUrl: string
    createdAt: Date,
    updatedAt: Date,
}

export interface Post_Enitity_Proto {
    id: number,
    userId: number;
    title: string;
    content: string;
    imageUrl: string;
    createdAt: TimeStamp,
    updatedAt: TimeStamp,
    userData: {
        login: string,
        avatarUrl:string
    }
}


export interface CretionNewPost {
    userId: number;
    title: string;
    content: string;
    imageUrl: string;
}


export interface RetrunPostEntity extends Post_Entity {
    commentCount: number,
    likeCount: number,
    isLiked: boolean
    userData: {
        login: string,
        avatarUrl:string
    }
}
