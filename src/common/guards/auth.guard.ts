import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest()
        const token = this.extractTokenFromRequest(req)
        console.log(token)
        if (!token) throw new UnauthorizedException('client tidak memiliki token authorization')
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('ACCESS')
            })
            req['user'] = { user_id: payload.sub, role: payload.role }
            return req['user']
        } catch (e) {
            switch (e.name) {
                case 'TokenExpiredError':
                    throw new UnauthorizedException('token kadaluarsa')
                default:
                    throw new UnauthorizedException()
            }
        }
    }

    extractTokenFromRequest(req: Request): string | undefined {
        const [type, token] = req.headers.authorization?.split(' ') ?? []
        return type === 'Bearer' ? token : undefined
    }
}