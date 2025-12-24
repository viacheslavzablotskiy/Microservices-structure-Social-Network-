import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";


@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
    catch(exception: RpcException, host: ArgumentsHost) {
        const ctx = host.switchToRpc()
        const data = ctx.getData()
        const context = ctx.getContext()

        console.log('GrpcExceptionFilter caught:', exception.getError(),'\nWith that data', data);
        
        return {code: 'INTERNATION', message: exception.message}
    }
}