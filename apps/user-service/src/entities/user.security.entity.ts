import { Entity, PrimaryGeneratedColumn, OneToOne, Column, BeforeInsert, BeforeUpdate } from "typeorm"
import { UserEntity } from "./user.entity"
import * as bcrypt from 'bcrypt'


@Entity()
export class UserSecurityEntity {

    @PrimaryGeneratedColumn()
    id: number

    @OneToOne(() => UserEntity, user => user.security)
    user: UserEntity

    @Column({nullable: false, unique: true}) 
    email: string

    @Column({nullable: false})
    passwordHash: string

    @Column({default: false})
    twoFactorEnabled: boolean

    @BeforeInsert()
    @BeforeUpdate()
    async hashPasword() {
        if (this.passwordHash) {
            const salt = await bcrypt.genSalt(10)
            this.passwordHash = await bcrypt.hash(this.passwordHash, salt)
        }

    }
}