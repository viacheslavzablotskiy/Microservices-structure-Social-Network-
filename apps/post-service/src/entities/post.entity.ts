import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm"

@Entity()
export class PostEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: false})
    userId: number

    @Column({nullable: false})
    title: string

    @Column({nullable: false})
    content: string

    @Column({nullable: false})
    imageUrl: string

    @CreateDateColumn({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date
}