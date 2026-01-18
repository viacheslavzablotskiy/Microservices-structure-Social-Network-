import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";



@Injectable()
export class AuthLoggerMiddlware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        console.log(req.body);
        next()
    }
}


@Injectable()
export class AuthTokenAuthorization implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const headerToken: string | undefined = req.headers['authorization']
        if (!headerToken) return res.status(401).send('you dont have token')
        if (!headerToken.split(' ')[1]) return res.status(401).send('Invalidate format Token')
        next()
    }
}