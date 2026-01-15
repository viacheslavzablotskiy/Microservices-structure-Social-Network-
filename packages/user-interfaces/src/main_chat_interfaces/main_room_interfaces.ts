export interface RoomDocument {
    id: string,
    name: string,
    participiants: number[],
    isGroup: boolean,
    createdAt: Date,
    updatedAt: Date
}


export type RoomTypeData = Omit<RoomDocument, 'createdAt' | 'updatedAt'>  & {createdAt: string, updatedAt: string}
