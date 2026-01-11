export interface RoomDocument {
    _id: string,
    name: string,
    participiants: number[],
    isGroup: boolean,
    createdAt: Date,
    updatedAt: Date
}