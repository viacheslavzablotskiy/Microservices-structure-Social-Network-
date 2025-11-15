import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class LikeEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: false})
    userId: number

    @Column({nullable: false})
    postId: number

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date
}