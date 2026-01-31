import { Observable } from "rxjs"



export type BatchDataPorto = Record<string, {avatarUrl: string, login: string}>



export interface DistUserService {
    getBatchData(userIds: number[]): Observable<BatchDataPorto>
}