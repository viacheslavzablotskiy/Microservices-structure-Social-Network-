import { Column, Entity, PrimaryGeneratedColumn, OneToOne, OneToMany, ManyToOne, JoinColumn } from "typeorm"
import { UpdateDateColumn } from "typeorm"
import { UserProfileEntity } from "./user.profile.entity"
import { UserSettingsEntity } from "./user.settings.entity"
import { UserSecurityEntity } from "./user.security.entity"
import { UserRealationEntity } from "./user.relations.entity"
import { UserStatsEntity } from "./user.stats.entity"

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    GHOST = 'ghost'
}

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({default: true})
    isActivate: boolean

    @Column({default: false})
    isVerified: boolean

    @Column({default: '', unique: true})
    login: string

    @Column({nullable: false, default: ''})  /// add default url for new users
    avatarUrl: string 

    @Column({nullable: false, default: ''}) /// ad default backgroud for new users
    coverUrl: string

    @Column({
        type:'enum',
        enum: UserRole,
        default: UserRole.GHOST
    })
    role: UserRole

    @Column({type:'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date

    @UpdateDateColumn({type:'timestamp'})
    updatedAt: Date

    @OneToOne(() => UserProfileEntity, {onDelete: 'CASCADE', cascade: true})
    @JoinColumn()
    profile: UserProfileEntity

    @OneToOne(() => UserSettingsEntity, {onDelete: 'CASCADE', cascade: true})
    @JoinColumn()
    settings: UserSettingsEntity

    @OneToOne(() => UserSecurityEntity, {onDelete: 'CASCADE'})
    @JoinColumn()
    security: UserSecurityEntity

    @OneToOne(() => UserStatsEntity, {onDelete: 'CASCADE', cascade: true})
    @JoinColumn()
    stats: UserStatsEntity

    @OneToMany(() => UserRealationEntity, user => user.sourceUser)
    outgoingRelations: UserRealationEntity[]

    @OneToMany(() => UserRealationEntity, user => user.targetUser)
    incomingRelations: UserRealationEntity[]
}