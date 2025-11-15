import { ManyToOne, Column, Entity, PrimaryGeneratedColumn, JoinColumn } from "typeorm"
import { UserEntity } from "./user.entity"


export enum RelationUsers {
    FRIEND = 'friend',
    FOLLOW = 'follow',
    BLOCK = 'block'
}

@Entity()
export class UserRealationEntity {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => UserEntity, user => user.outgoingRelations, {cascade: true})
    @JoinColumn({name: 'sourceUserId'})
    sourceUser: UserEntity

    @ManyToOne(() => UserEntity, user => user.incomingRelations, {cascade: true})
    @JoinColumn({name: 'targetUserId'})
    targetUser: UserEntity

    @Column({type: 'enum',
        enum: RelationUsers,
        default: RelationUsers.FOLLOW
    })
    typeAction: RelationUsers
}
