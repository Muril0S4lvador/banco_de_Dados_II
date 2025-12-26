import { Request, Response } from "express";
import { RouteResponse } from "../helpers/RouteResponse";
import { UserRepository } from "../repository/UserRepository";
import { UserEntity } from "../entity/User";
import * as bcrypt from 'bcryptjs';

export class UserController {
    /**
     * @swagger
     * /user:
     *   post:
     *     summary: Criar novo usuário
     *     tags: [Users]
     *     consumes:
     *       - application/json
     *     produces:
     *       - application/json
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - username
     *               - name
     *               - password
     *               - roleIds
     *             properties:
     *               username:
     *                 type: string
     *                 example: "joao.silva"
     *               name:
     *                 type: string
     *                 example: "João da Silva"
     *               password:
     *                 type: string
     *                 example: "senha123"
     *               roleIds:
     *                 type: array
     *                 items:
     *                   type: string
     *                 example: ["role_001", "role_002"]
     *     responses:
     *       '201':
     *         description: Usuário criado com sucesso
     *       '400':
     *         description: Dados inválidos
     *       '409':
     *         description: Username já existe
     */
    static async createUser(req: Request, res: Response) {
        try {
            const { username, name, password, roleIds } = req.body;

            // Validações
            if (!username || !username.trim()) {
                return RouteResponse.error(res, 'Username é obrigatório', 400);
            }

            if (!name || !name.trim()) {
                return RouteResponse.error(res, 'Nome é obrigatório', 400);
            }

            if (!password || password.length < 6) {
                return RouteResponse.error(res, 'Senha deve ter no mínimo 6 caracteres', 400);
            }

            if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
                return RouteResponse.error(res, 'Pelo menos uma role deve ser atribuída', 400);
            }

            const userRepository = new UserRepository();

            // Verifica se username já existe
            const existingUser = await userRepository.findUserByUsername(username);
            if (existingUser) {
                return RouteResponse.error(res, 'Username já está em uso', 409);
            }

            // Hash da senha
            const hashedPassword = await bcrypt.hash(password, 10);

            // Cria usuário
            const user = new UserEntity({
                username: username.trim(),
                name: name.trim(),
                password: hashedPassword,
                roleIds: roleIds,
            });

            const createdUser = await userRepository.createUser(user);

            return RouteResponse.success(res, createdUser.toPublic(), 'Usuário criado com sucesso', 201);
        } catch (error) {
            console.error('Error creating user:', error);
            return RouteResponse.error(res, 'Erro ao criar usuário', 500);
        }
    }

    /**
     * @swagger
     * /user:
     *   get:
     *     summary: Listar todos os usuários
     *     tags: [Users]
     *     produces:
     *       - application/json
     *     responses:
     *       '200':
     *         description: Lista de usuários
     *       '500':
     *         description: Erro interno do servidor
     */
    static async listUsers(req: Request, res: Response) {
        try {
            const userRepository = new UserRepository();
            const users = await userRepository.listAllUsers();

            const publicUsers = users.map(user => {
                const userData = user.toPublic();
                // Adiciona userType baseado nas roles
                const userType = user.roleIds?.includes('admin') ? 'admin' : 'user';
                return { ...userData, userType };
            });

            return RouteResponse.success(res, publicUsers, 'Usuários listados com sucesso');
        } catch (error) {
            console.error('Error listing users:', error);
            return RouteResponse.error(res, 'Erro ao listar usuários', 500);
        }
    }

    /**
     * @swagger
     * /user/{userId}:
     *   get:
     *     summary: Buscar usuário por ID
     *     tags: [Users]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userId
     *         in: path
     *         required: true
     *         description: ID do usuário
     *         schema:
     *           type: string
     *     responses:
     *       '200':
     *         description: Usuário encontrado
     *       '404':
     *         description: Usuário não encontrado
     *       '500':
     *         description: Erro interno do servidor
     */
    static async getUser(req: Request, res: Response) {
        try {
            const { userId } = req.params;

            if (!userId) {
                return RouteResponse.error(res, 'userId é obrigatório', 400);
            }

            const userRepository = new UserRepository();
            const user = await userRepository.findUserByUserId(userId);

            if (!user) {
                return RouteResponse.error(res, 'Usuário não encontrado', 404);
            }

            const userData = user.toPublic();
            const userType = user.roleIds?.some(roleId => roleId.includes('admin')) ? 'admin' : 'user';
            return RouteResponse.success(res, { ...userData, userType }, 'Usuário encontrado');
        } catch (error) {
            console.error('Error getting user:', error);
            return RouteResponse.error(res, 'Erro ao buscar usuário', 500);
        }
    }

    /**
     * @swagger
     * /user/{userId}:
     *   put:
     *     summary: Atualizar usuário
     *     tags: [Users]
     *     consumes:
     *       - application/json
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userId
     *         in: path
     *         required: true
     *         description: ID do usuário
     *         schema:
     *           type: string
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               username:
     *                 type: string
     *                 example: "joao.silva"
     *               name:
     *                 type: string
     *                 example: "João da Silva Santos"
     *               roleIds:
     *                 type: array
     *                 items:
     *                   type: string
     *                 example: ["role_001", "role_003"]
     *     responses:
     *       '200':
     *         description: Usuário atualizado com sucesso
     *       '400':
     *         description: Dados inválidos
     *       '404':
     *         description: Usuário não encontrado
     *       '409':
     *         description: Username já existe
     */
    static async updateUser(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const { username, name, roleIds } = req.body;

            if (!userId) {
                return RouteResponse.error(res, 'userId é obrigatório', 400);
            }

            // Proteção do usuário admin
            if (userId === 'user_admin_001' && roleIds !== undefined) {
                return RouteResponse.error(res, 'Não é permitido alterar as roles do usuário administrador', 403);
            }

            const userRepository = new UserRepository();
            const user = await userRepository.findUserByUserId(userId);

            if (!user) {
                return RouteResponse.error(res, 'Usuário não encontrado', 404);
            }

            // Atualiza username se fornecido
            if (username !== undefined) {
                if (!username.trim()) {
                    return RouteResponse.error(res, 'Username não pode estar vazio', 400);
                }

                // Verifica se o novo username já está em uso por outro usuário
                if (username !== user.username) {
                    const existingUser = await userRepository.findUserByUsername(username);
                    if (existingUser && existingUser.userId !== userId) {
                        return RouteResponse.error(res, 'Username já está em uso', 409);
                    }
                    user.username = username.trim();
                }
            }

            // Atualiza nome se fornecido
            if (name !== undefined) {
                if (!name.trim()) {
                    return RouteResponse.error(res, 'Nome não pode estar vazio', 400);
                }
                user.name = name.trim();
            }

            // Atualiza roles se fornecido
            if (roleIds !== undefined) {
                if (!Array.isArray(roleIds) || roleIds.length === 0) {
                    return RouteResponse.error(res, 'Pelo menos uma role deve ser atribuída', 400);
                }
                user.roleIds = roleIds;
            }

            const updatedUser = await userRepository.updateUser(user);

            const userData = updatedUser.toPublic();
            const userType = updatedUser.roleIds?.includes('admin') ? 'admin' : 'user';
            return RouteResponse.success(res, { ...userData, userType }, 'Usuário atualizado com sucesso');
        } catch (error) {
            console.error('Error updating user:', error);
            return RouteResponse.error(res, 'Erro ao atualizar usuário', 500);
        }
    }

    /**
     * @swagger
     * /user/{userId}/password:
     *   put:
     *     summary: Alterar senha do usuário
     *     tags: [Users]
     *     consumes:
     *       - application/json
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userId
     *         in: path
     *         required: true
     *         description: ID do usuário
     *         schema:
     *           type: string
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - newPassword
     *             properties:
     *               newPassword:
     *                 type: string
     *                 example: "novaSenha123"
     *     responses:
     *       '200':
     *         description: Senha alterada com sucesso
     *       '400':
     *         description: Dados inválidos
     *       '404':
     *         description: Usuário não encontrado
     */
    static async changePassword(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const { newPassword } = req.body;

            if (!userId) {
                return RouteResponse.error(res, 'userId é obrigatório', 400);
            }

            if (!newPassword || newPassword.length < 6) {
                return RouteResponse.error(res, 'Nova senha deve ter no mínimo 6 caracteres', 400);
            }

            const userRepository = new UserRepository();
            const user = await userRepository.findUserByUserId(userId);

            if (!user) {
                return RouteResponse.error(res, 'Usuário não encontrado', 404);
            }

            // Hash da nova senha
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;

            await userRepository.updateUser(user);

            return RouteResponse.success(res, { message: 'Senha alterada com sucesso' });
        } catch (error) {
            console.error('Error changing password:', error);
            return RouteResponse.error(res, 'Erro ao alterar senha', 500);
        }
    }

    /**
     * @swagger
     * /user/{userId}:
     *   delete:
     *     summary: Deletar usuário
     *     tags: [Users]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userId
     *         in: path
     *         required: true
     *         description: ID do usuário
     *         schema:
     *           type: string
     *     responses:
     *       '200':
     *         description: Usuário deletado com sucesso
     *       '404':
     *         description: Usuário não encontrado
     *       '500':
     *         description: Erro interno do servidor
     */
    static async deleteUser(req: Request, res: Response) {
        try {
            const { userId } = req.params;

            if (!userId) {
                return RouteResponse.error(res, 'userId é obrigatório', 400);
            }

            // Proteção do usuário admin
            if (userId === 'user_admin_001') {
                return RouteResponse.error(res, 'Não é permitido deletar o usuário administrador', 403);
            }

            const userRepository = new UserRepository();
            const user = await userRepository.findUserByUserId(userId);

            if (!user) {
                return RouteResponse.error(res, 'Usuário não encontrado', 404);
            }

            await userRepository.deleteUser(userId);

            return RouteResponse.success(res, { message: 'Usuário deletado com sucesso' });
        } catch (error) {
            console.error('Error deleting user:', error);
            return RouteResponse.error(res, 'Erro ao deletar usuário', 500);
        }
    }
}
