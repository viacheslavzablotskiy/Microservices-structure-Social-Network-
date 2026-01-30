import { Observable } from "rxjs"



export type BatchDataPorto = Record<string, {id: number, avatarKey: string, login: string}>



export interface DistUserService {
    getBatchData(userIds: number[]): Observable<BatchDataPorto>
}