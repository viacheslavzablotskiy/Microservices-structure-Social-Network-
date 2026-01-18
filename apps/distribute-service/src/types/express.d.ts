import { JwtTokenDto } from "@repo/api";


declare global {
    namespace Express {
        export interface Request {
            user?: JwtTokenDto
        }
    }
}


