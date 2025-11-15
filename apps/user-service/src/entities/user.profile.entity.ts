import { Entity, OneToOne, PrimaryGeneratedColumn, Column } from "typeorm"
import { UserEntity } from "./user.entity"

export enum GenderUser {
    NONE = 'none',
    WOMEN = 'women',
    MAN = 'man',
}

@Entity()
export class UserProfileEntity {
    
    @PrimaryGeneratedColumn()
    id: number

    @OneToOne(() => UserEntity, user => user.profile)
    user: UserEntity

    @Column({default: ''})
    firstname: string

    @Column({default: ''})
    lastname: string
    
    @Column({default: ''})
    bio: string

    @Column({default: ''})
    location: string
    
    @Column({default: ''})
    website: string

    @Column({type:'date', nullable: true})
    birthday: Date

    @Column({type:'enum',
        enum: GenderUser,
        default: GenderUser.NONE
    })
    gender: GenderUser
}