import { ArgumentsHost, Catch, ExceptionFilter, ExecutionContext, HttpException } from "@nestjs/common";
import { Response } from "express";


@Catch(HttpException)
export class HttpEXceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<Request>()
        const status = exception.getStatus()

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            url: request.url
        })
}
}