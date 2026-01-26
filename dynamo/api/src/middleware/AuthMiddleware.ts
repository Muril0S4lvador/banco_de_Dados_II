import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { TokenRepository } from '../repository/TokenRepository'
import { UserRepository } from '../repository/UserRepository'
import { RouteResponse } from '../helpers/RouteResponse'

export interface AuthRequest extends Request {
    user?: {
        userId: string
        username: string
        name: string
        roleIds: string[]
    }
}

export class AuthMiddleware {
    static async authenticate(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.headers.authorization || !req.headers.authorization.includes('Bearer')) {
                return RouteResponse.error(res, 'Token inválido ou ausente', 401)
            }

            const token = req.headers.authorization.replace('Bearer ', '')

            let decoded: any
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET as string)
            } catch (error) {
                return RouteResponse.error(res, 'Token inválido ou expirado', 401)
            }

            // Verifica se o token existe no banco
            const tokenRepository = new TokenRepository()
            const tokenFound = await tokenRepository.findToken(token)

            if (!tokenFound) {
                return RouteResponse.error(res, 'Token não encontrado', 401)
            }

            // Busca os dados do usuário
            const userRepository = new UserRepository()
            const user = await userRepository.findUserByUserId(decoded.userId)

            if (!user) {
                return RouteResponse.error(res, 'Usuário não encontrado', 401)
            }

            // Adiciona os dados do usuário ao request
            req.user = {
                userId: user.userId,
                username: user.username,
                name: user.name,
                roleIds: user.roleIds || []
            }

            next()
        } catch (error: any) {
            console.error('Authentication error:', error)
            return RouteResponse.error(res, 'Erro na autenticação: ' + error.message, 500)
        }
    }
}
