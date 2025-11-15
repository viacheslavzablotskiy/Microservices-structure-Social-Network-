import { Entity, PrimaryGeneratedColumn, OneToOne, Column } from "typeorm"
import { UserEntity } from "./user.entity"


@Entity()
export class UserStatsEntity {
    
    @PrimaryGeneratedColumn()
    id: number

    @OneToOne(() => UserEntity, user => user.stats)
    user: UserEntity

    @Column({default: 0})
    postsCount: number

    @Column({default: 0})
    followersCount: number

    @Column({default: 0})
    followingCount: number

    @Column({default: 0})
    likesCount: number
}