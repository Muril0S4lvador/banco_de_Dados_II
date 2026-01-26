import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RouteResponse } from "../helpers/RouteResponse";
import { UserRepository } from "../repository/UserRepository";
import { TokenRepository } from "../repository/TokenRepository";
import { UserEntity } from "../entity/User";
import { TokenEntity } from "../entity/Token";
import { LoginRequestBody } from "../model/interfaces/auth/LoginRequestBody";

export class AuthController {
    /**
   * @swagger
   * /login:
   *   post:
   *     summary: Autenticação do Usuário
   *     tags: [Auth]
   *     consumes:
   *       - application/json
   *     produces:
   *       - application/json
   *     requestBody:
   *       content:
   *        application/json:
   *          schema:
   *            type: object
   *            required:
   *              - username
   *              - password
   *            properties:
   *              username:
   *                type: string
   *                example: "ADMIN"
   *              password:
   *                type: string
   *                example: "ADMIN"
   *     responses:
   *       '200':
   *         description: Requisição executada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   description: Status da requisição
   *                   example: "true"
   *                 data:
   *                   type: string
   *                   description: Token JWT de autenticação
   *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *       '500':
   *         description: Dados incorretos ou ausentes
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Nome de usuário ou senha incorretos"
   *       '404':
   *         description: Dados do usuário incorretos
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Nome de usuário ou senha incorretos"
   */
    async login(request: Request, response: Response): Promise<any> {
        const { username, password }: LoginRequestBody = request.body;
        const tokenRepository: TokenRepository = new TokenRepository();
        const userRepository: UserRepository = new UserRepository();

        if (!username || !password) {
            return RouteResponse.error(response, "Nome de usuário ou senha ausentes");
        }

        const existingUser: UserEntity | null =
            await userRepository.findUserByUsername(username);

        if (!existingUser) {
            return RouteResponse.notFound(
                response,
                "Nome de usuário ou senha incorretos"
            );
        }

        const validPassword: boolean = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (!validPassword) {
            return RouteResponse.error(
                response,
                "Nome de usuário ou senha incorretos"
            );
        }

        const token: string = jwt.sign(
            {
                userId: existingUser.userId,
                username: existingUser.username
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn: "24h",
            }
        );

        const decoded: any = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        );
        const expiresAt: string = new Date(decoded.exp * 1000).toISOString();

        await tokenRepository.createToken({
            userId: existingUser.userId,
            token: token,
            expiresAt: expiresAt
        });

        return RouteResponse.success(response, { token });
    }

    /**
     * @swagger
     * /me:
     *   get:
     *     summary: Retorna as informações de um usuário de acordo com o token
     *     tags: [Auth]
     *     produces:
     *       - application/json
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       '200':
     *          description: Requisição executada com sucesso
     *          content:
     *            application/json:
     *              schema:
     *                type: object
     *                properties:
     *                  success:
     *                    type: boolean
     *                    example: true
     *                  data:
     *                    type: object
     *                    properties:
     *                      userId:
     *                        type: string
     *                        example: 'user_admin_001'
     *                      username:
     *                        type: string
     *                        example: 'ADMIN'
     *                      name:
     *                        type: string
     *                        example: 'Administrator'
     *                      roleIds:
     *                        type: array
     *                        items:
     *                          type: string
     *                        example: ['role_admin']
     *                      createdAt:
     *                        type: string
     *                        example: '2025-01-01T00:00:00.000Z'
     *                      updatedAt:
     *                        type: string
     *                        example: '2025-01-01T00:00:00.000Z'
     *                      entityType:
     *                        type: string
     *                        example: 'USER'
     *       '404':
     *         description: Token válido, mas usuário não encontrado
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Usuário não encontrado"
     *       '400':
     *         description: Token ausente ou inválido
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Token inválido ou ausente"
     */
    async returnUserInfo(req: Request, res: Response): Promise<any> {
        const userRepository: UserRepository = new UserRepository();
        const tokenRepository: TokenRepository = new TokenRepository();

        if (
            !req.headers.authorization ||
            !req.headers.authorization.includes("Bearer")
        ) {
            return RouteResponse.error(res, "Token inválido ou ausente");
        }

        const token: string = req.headers.authorization.replace("Bearer ", "");
        let decoded: any = null;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET as string);
            const tokenFound: TokenEntity | null = await tokenRepository.findToken(token);

            if (!decoded || !decoded.userId || !tokenFound) {
                throw new Error();
            }
        } catch (error) {
            return RouteResponse.error(res, "Token inválido ou ausente");
        }

        const existingUser: UserEntity | null = await userRepository.findUserByUserId(
            decoded.userId
        );

        if (!existingUser) {
            return RouteResponse.notFound(res, "Usuário não encontrado");
        }

        return RouteResponse.success(res, existingUser.toPublic());
    }
}
