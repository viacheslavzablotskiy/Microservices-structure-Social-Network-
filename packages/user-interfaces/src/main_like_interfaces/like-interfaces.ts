import { TimeStamp } from "@repo/static-data"



export interface Like_Entity{
    id: number,
    userId: number,
    postId: number,
    createdAt: Date
}


export interface Like_Proto_Entity {
    id: number,
    userId: number,
    postId: number,
    createdAt: TimeStamp
}