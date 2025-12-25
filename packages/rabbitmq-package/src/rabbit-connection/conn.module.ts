import {Module, type DynamicModule} from "@nestjs/common";
import { ConnectionService } from "./conn.provider";


@Module({})
export class ConnectionModule {
    static registerAsync(
        options: {
            inject: any[],
            useFactory: (...args: any[]) => {RABBITMQ_URL: string} 
        }
    ): DynamicModule  {
        return {
            module: ConnectionModule,
            imports: [],
            providers: [{
                provide: 'GET_RABBITMQ_URL',
                inject: options.inject || [],
                useFactory: options.useFactory,
                
            },
            ConnectionService],
            exports: [ConnectionService]
        }
    }  
}

