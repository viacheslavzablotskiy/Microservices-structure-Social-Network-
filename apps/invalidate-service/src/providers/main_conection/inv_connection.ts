import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import * as  amqp from 'amqplib'

@Injectable()
export class RabbitConnectionService implements OnModuleInit, OnModuleDestroy {
    private conn: amqp.ChannelModel

    async onModuleInit() {
        this.conn = await amqp.connect('amqp://localhost:5672')
    }

    async getConnection(): Promise<amqp.ChannelModel> {
        return this.conn
    }

    async onModuleDestroy() {
        if (this.conn) {
            await this.conn.close()
        }
    }
}