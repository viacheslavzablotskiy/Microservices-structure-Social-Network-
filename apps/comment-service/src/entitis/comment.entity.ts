import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity()
export class CommentEnity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: false})
    userId: number

    @Column({nullable: false})
    postId: number

    @Column({nullable: false})
    content: string

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date
    
    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date
}