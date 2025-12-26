import { Response } from 'express'
import { AuthRequest } from '../middleware/AuthMiddleware'
import { RouteResponse } from '../helpers/RouteResponse'
import { RoleRepository } from '../repository/RoleRepository'

export class UserPermissionsController {
    /**
     * @swagger
     * /user/permissions:
     *   get:
     *     summary: Buscar permissões do usuário logado para todas as tabelas
     *     tags: [User]
     *     responses:
     *       '200':
     *         description: Permissões retornadas com sucesso
     */
    static async getMyPermissions(req: AuthRequest, res: Response) {
        try {
            const user = req.user

            if (!user) {
                return RouteResponse.error(res, 'Usuário não autenticado', 401)
            }

            const roleRepo = new RoleRepository()

            // Se é admin, retorna todas as permissões
            if (user.roleIds?.includes('admin')) {
                // Busca todas as tabelas
                const tablesResponse = await fetch('http://localhost:3000/tables/names')
                const tablesData = await tablesResponse.json() as { data?: string[] }
                const tables = tablesData.data || []

                const permissions: Record<string, any> = {}
                tables.forEach((tableName: string) => {
                    permissions[tableName] = {
                        allowedView: true,
                        allowedEdit: true,
                        allowedDelete: true
                    }
                })

                return RouteResponse.success(res, permissions, 'Permissões retornadas com sucesso')
            }

            // Busca permissões de todas as roles do usuário e agrega
            const allPermissions: Record<string, any> = {}

            for (const roleId of user.roleIds || []) {
                const role = await roleRepo.findRoleByRoleId(roleId)

                if (role && role.permissions) {
                    // Itera sobre as permissões da role
                    role.permissions.forEach(permission => {
                        if (!allPermissions[permission.tableName]) {
                            allPermissions[permission.tableName] = {
                                allowedView: false,
                                allowedEdit: false,
                                allowedDelete: false
                            }
                        }

                        // Se qualquer role tem a permissão, o usuário tem
                        if (permission.allowedView) allPermissions[permission.tableName].allowedView = true
                        if (permission.allowedEdit) allPermissions[permission.tableName].allowedEdit = true
                        if (permission.allowedDelete) allPermissions[permission.tableName].allowedDelete = true
                    })
                }
            }

            return RouteResponse.success(res, allPermissions, 'Permissões retornadas com sucesso')
        } catch (error: any) {
            console.error('Error getting user permissions:', error)
            return RouteResponse.error(res, 'Erro ao buscar permissões: ' + error.message, 500)
        }
    }
}
