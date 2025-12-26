import { Request, Response } from "express";
import { RouteResponse } from "../helpers/RouteResponse";
import { RoleRepository } from "../repository/RoleRepository";
import { UserRepository } from "../repository/UserRepository";
import { RoleEntity, RolePermission } from "../entity/Role";

export class RoleController {
    /**
     * @swagger
     * /role:
     *   post:
     *     summary: Criar nova role com permissões
     *     tags: [Roles]
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
     *               - name
     *               - description
     *             properties:
     *               name:
     *                 type: string
     *                 example: "Gerente"
     *               description:
     *                 type: string
     *                 example: "Gerente de filial com acesso a operações bancárias"
     *               permissions:
     *                 type: array
     *                 items:
     *                   type: object
     *                   properties:
     *                     table:
     *                       type: string
     *                       example: "customer"
     *                     select:
     *                       type: boolean
     *                       example: true
     *                     insert:
     *                       type: boolean
     *                       example: true
     *                     delete:
     *                       type: boolean
     *                       example: false
     *     responses:
     *       '201':
     *         description: Role criada com sucesso
     *       '400':
     *         description: Dados inválidos
     *       '409':
     *         description: Role com esse nome já existe
     */
    static async createRole(req: Request, res: Response) {
        try {
            const { name, description, permissions } = req.body;

            if (!name || !name.trim()) {
                return RouteResponse.error(res, 'Nome da role é obrigatório', 400);
            }

            if (!description || !description.trim()) {
                return RouteResponse.error(res, 'Descrição da role é obrigatória', 400);
            }

            const nameValidation = RoleEntity.validateRoleName(name);
            if (!nameValidation.valid) {
                return RouteResponse.error(res, nameValidation.error || 'Nome inválido', 400);
            }

            const roleRepository = new RoleRepository();

            const existingRole = await roleRepository.findRoleByName(name);
            if (existingRole) {
                return RouteResponse.error(res, 'Já existe uma role com este nome', 409);
            }

            const rolePermissions: RolePermission[] = (permissions || []).map((p: any) => ({
                tableName: p.table,
                allowedView: p.select || false,
                allowedEdit: p.insert || false,
                allowedDelete: p.delete || false,
            })).filter((p: RolePermission) => p.allowedView || p.allowedEdit || p.allowedDelete);

            const role = RoleEntity.createCustomRole(
                name,
                description,
                rolePermissions
            );

            const createdRole = await roleRepository.createRole(role);

            return RouteResponse.success(res, {
                roleId: createdRole.roleId,
                name: createdRole.name,
                description: createdRole.description,
                permissions: createdRole.permissions,
                createdAt: createdRole.createdAt,
            }, 'Role criada com sucesso', 201);

        } catch (error: any) {
            console.error('Error creating role:', error);
            return RouteResponse.error(res, 'Erro ao criar role: ' + error.message, 500);
        }
    }

    /**
     * @swagger
     * /role:
     *   get:
     *     summary: Listar todas as roles
     *     tags: [Roles]
     *     produces:
     *       - application/json
     *     responses:
     *       '200':
     *         description: Lista de roles retornada com sucesso
     */
    static async listRoles(req: Request, res: Response) {
        try {
            const roleRepository = new RoleRepository();
            const roles = await roleRepository.listAllRoles();

            return RouteResponse.success(res, roles, 'Roles listadas com sucesso');
        } catch (error: any) {
            console.error('Error listing roles:', error);
            return RouteResponse.error(res, 'Erro ao listar roles: ' + error.message, 500);
        }
    }

    /**
     * @swagger
     * /role/{roleId}:
     *   get:
     *     summary: Buscar role específica por ID
     *     tags: [Roles]
     *     produces:
     *       - application/json
     *     parameters:
     *       - in: path
     *         name: roleId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID da role
     *         example: "role_1234567890_abc123"
     *     responses:
     *       '200':
     *         description: Role encontrada
     *       '404':
     *         description: Role não encontrada
     */
    static async getRole(req: Request, res: Response) {
        try {
            const { roleId } = req.params;
            const roleRepository = new RoleRepository();
            const role = await roleRepository.findRoleByRoleId(roleId);

            if (!role) {
                return RouteResponse.error(res, 'Role não encontrada', 404);
            }

            return RouteResponse.success(res, role, 'Role encontrada');
        } catch (error: any) {
            console.error('Error getting role:', error);
            return RouteResponse.error(res, 'Erro ao buscar role: ' + error.message, 500);
        }
    }

    /**
     * @swagger
     * /role/{roleId}:
     *   put:
     *     summary: Atualizar role existente
     *     tags: [Roles]
     *     consumes:
     *       - application/json
     *     produces:
     *       - application/json
     *     parameters:
     *       - in: path
     *         name: roleId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID da role
     *         example: "role_1234567890_abc123"
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 example: "Gerente Atualizado"
     *               description:
     *                 type: string
     *                 example: "Descrição atualizada"
     *               permissions:
     *                 type: array
     *                 items:
     *                   type: object
     *                   properties:
     *                     table:
     *                       type: string
     *                       example: "customer"
     *                     select:
     *                       type: boolean
     *                       example: true
     *                     insert:
     *                       type: boolean
     *                       example: true
     *                     delete:
     *                       type: boolean
     *                       example: false
     *     responses:
     *       '200':
     *         description: Role atualizada com sucesso
     *       '400':
     *         description: Dados inválidos
     *       '404':
     *         description: Role não encontrada
     *       '403':
     *         description: Não é permitido editar roles do sistema
     */
    static async updateRole(req: Request, res: Response) {
        try {
            const { roleId } = req.params;
            const { name, description, permissions } = req.body;

            const roleRepository = new RoleRepository();
            const existingRole = await roleRepository.findRoleByRoleId(roleId);

            if (!existingRole) {
                return RouteResponse.error(res, 'Role não encontrada', 404);
            }

            if (!existingRole.isCustom) {
                return RouteResponse.error(res, 'Não é permitido editar roles do sistema', 403);
            }

            if (name && name.trim()) {
                const nameValidation = RoleEntity.validateRoleName(name);
                if (!nameValidation.valid) {
                    return RouteResponse.error(res, nameValidation.error || 'Nome inválido', 400);
                }

                if (name !== existingRole.name) {
                    const roleWithSameName = await roleRepository.findRoleByName(name);
                    if (roleWithSameName) {
                        return RouteResponse.error(res, 'Já existe uma role com este nome', 409);
                    }
                }

                existingRole.name = name;
            }

            if (description && description.trim()) {
                existingRole.description = description;
            }

            if (permissions !== undefined) {
                const rolePermissions: RolePermission[] = (permissions || []).map((p: any) => ({
                    tableName: p.table || p.tableName,
                    allowedView: p.select !== undefined ? p.select : p.allowedView || false,
                    allowedEdit: p.insert !== undefined ? p.insert : p.allowedEdit || false,
                    allowedDelete: p.delete !== undefined ? p.delete : p.allowedDelete || false,
                })).filter((p: RolePermission) => p.allowedView || p.allowedEdit || p.allowedDelete);

                existingRole.permissions = rolePermissions;
            }

            const updatedRole = await roleRepository.updateRole(existingRole);

            return RouteResponse.success(res, {
                roleId: updatedRole.roleId,
                name: updatedRole.name,
                description: updatedRole.description,
                permissions: updatedRole.permissions,
                updatedAt: updatedRole.updatedAt,
            }, 'Role atualizada com sucesso');

        } catch (error: any) {
            console.error('Error updating role:', error);
            return RouteResponse.error(res, 'Erro ao atualizar role: ' + error.message, 500);
        }
    }

    /**
     * @swagger
     * /role/{roleId}:
     *   delete:
     *     summary: Deletar role
     *     tags: [Roles]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: roleId
     *         in: path
     *         required: true
     *         description: ID da role
     *         schema:
     *           type: string
     *     responses:
     *       '200':
     *         description: Role deletada com sucesso
     *       '403':
     *         description: Role não pode ser deletada (sistema ou em uso)
     *       '404':
     *         description: Role não encontrada
     *       '500':
     *         description: Erro interno do servidor
     */
    static async deleteRole(req: Request, res: Response) {
        try {
            const { roleId } = req.params;

            if (!roleId) {
                return RouteResponse.error(res, 'roleId é obrigatório', 400);
            }

            const roleRepository = new RoleRepository();
            const role = await roleRepository.findRoleByRoleId(roleId);

            if (!role) {
                return RouteResponse.error(res, 'Role não encontrada', 404);
            }

            // Verifica se é uma role do sistema
            if (!role.isCustom) {
                return RouteResponse.error(res, 'Não é permitido deletar roles do sistema', 403);
            }

            // Verifica se a role está sendo usada por algum usuário
            const userRepository = new UserRepository();
            const usersWithRole = await userRepository.findUsersByRole(roleId);

            if (usersWithRole.length > 0) {
                return RouteResponse.error(
                    res,
                    `Não é possível deletar esta role pois está sendo usada por ${usersWithRole.length} usuário(s)`,
                    403
                );
            }

            await roleRepository.deleteRole(roleId);

            return RouteResponse.success(res, { message: 'Role deletada com sucesso' });
        } catch (error: any) {
            console.error('Error deleting role:', error);
            return RouteResponse.error(res, 'Erro ao deletar role: ' + error.message, 500);
        }
    }
}
