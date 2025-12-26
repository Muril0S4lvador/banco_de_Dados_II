import { Request, Response, NextFunction } from 'express'
import { RoleRepository } from '../repository/RoleRepository'
import { RouteResponse } from '../helpers/RouteResponse'
import { AuthRequest } from './AuthMiddleware'

export type PermissionType = 'view' | 'edit' | 'delete'

export class PermissionMiddleware {
    static checkPermission(tableName: string, permissionType: PermissionType) {
        return async (req: AuthRequest, res: Response, next: NextFunction) => {
            try {
                const user = req.user

                if (!user) {
                    return RouteResponse.error(res, 'Usuário não autenticado', 401)
                }

                // Admin tem todas as permissões
                if (user.roleIds?.includes('admin')) {
                    return next()
                }

                const roleRepo = new RoleRepository()
                let hasPermission = false

                // Verifica permissões para cada role do usuário
                for (const roleId of user.roleIds || []) {
                    const role = await roleRepo.findRoleByRoleId(roleId)

                    if (role && role.permissions) {
                        // Busca a permissão específica para esta tabela
                        const permission = role.permissions.find(p => p.tableName === tableName)

                        if (permission) {
                            switch (permissionType) {
                                case 'view':
                                    if (permission.allowedView) hasPermission = true
                                    break
                                case 'edit':
                                    if (permission.allowedEdit) hasPermission = true
                                    break
                                case 'delete':
                                    if (permission.allowedDelete) hasPermission = true
                                    break
                            }
                        }
                    }

                    if (hasPermission) break
                }

                if (!hasPermission) {
                    return RouteResponse.error(res, `Você não tem permissão para ${permissionType === 'view' ? 'visualizar' : permissionType === 'edit' ? 'editar' : 'deletar'} esta tabela`, 403)
                }

                next()
            } catch (error: any) {
                console.error('Error checking permission:', error)
                return RouteResponse.error(res, 'Erro ao verificar permissão: ' + error.message, 500)
            }
        }
    }

    // Helper para verificar múltiplas permissões de uma vez
    static async getUserPermissions(roleIds: string[], tableName: string) {
        const roleRepo = new RoleRepository()

        const permissions = {
            allowedView: false,
            allowedEdit: false,
            allowedDelete: false
        }

        // Admin tem todas as permissões
        if (roleIds.includes('admin')) {
            return {
                allowedView: true,
                allowedEdit: true,
                allowedDelete: true
            }
        }

        // Verifica permissões para cada role
        for (const roleId of roleIds) {
            const role = await roleRepo.findRoleByRoleId(roleId)

            if (role && role.permissions) {
                const permission = role.permissions.find(p => p.tableName === tableName)

                if (permission) {
                    if (permission.allowedView) permissions.allowedView = true
                    if (permission.allowedEdit) permissions.allowedEdit = true
                    if (permission.allowedDelete) permissions.allowedDelete = true
                }
            }

            return permissions
        }
    }
}
