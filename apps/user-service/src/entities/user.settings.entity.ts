import { Entity, Column, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { UserEntity } from "./user.entity"


export enum ThemeSettings  {
    DARK = 'dark',
    WHITE = 'white'
}

@Entity()
export class UserSettingsEntity { /// more swttings

    @PrimaryGeneratedColumn()
    id: number

    @OneToOne(() => UserEntity, user => user.settings)
    user: UserEntity
    
    @Column({type:'enum',
        enum: ThemeSettings,
        default: ThemeSettings.WHITE})
    theme: ThemeSettings

    @Column({default: 'English'})
    language: string
    
    @Column({default: false})
    isPrivate: boolean 

}