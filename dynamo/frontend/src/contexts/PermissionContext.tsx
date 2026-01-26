import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { useAuthContext } from './AuthContext'
import { permissionService, UserPermissions, TablePermissions } from '../services/permissionService'

interface PermissionContextType {
    permissions: UserPermissions
    loading: boolean
    hasPermission: (tableName: string, permissionType: 'view' | 'edit' | 'delete') => boolean
    getTablePermissions: (tableName: string) => TablePermissions
    refreshPermissions: () => Promise<void>
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined)

export function PermissionProvider({ children }: { children: ReactNode }) {
    const { user, isAuthenticated } = useAuthContext()
    const [permissions, setPermissions] = useState<UserPermissions>({})
    const [loading, setLoading] = useState(true)

    const loadPermissions = async () => {
        if (!isAuthenticated) {
            setPermissions({})
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const userPermissions = await permissionService.getMyPermissions()
            setPermissions(userPermissions)
        } catch (error) {
            console.error('Error loading permissions:', error)
            setPermissions({})
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadPermissions()
    }, [isAuthenticated, user])

    const hasPermission = (tableName: string, permissionType: 'view' | 'edit' | 'delete'): boolean => {
        // Admin tem todas as permissões
        if (user?.roleIds?.includes('admin')) {
            return true
        }

        const tablePerms = permissions[tableName]
        if (!tablePerms) return false

        switch (permissionType) {
            case 'view':
                return tablePerms.allowedView
            case 'edit':
                return tablePerms.allowedEdit
            case 'delete':
                return tablePerms.allowedDelete
            default:
                return false
        }
    }

    const getTablePermissions = (tableName: string): TablePermissions => {
        // Admin tem todas as permissões
        if (user?.roleIds?.includes('admin')) {
            return {
                allowedView: true,
                allowedEdit: true,
                allowedDelete: true
            }
        }

        return permissions[tableName] || {
            allowedView: false,
            allowedEdit: false,
            allowedDelete: false
        }
    }

    const refreshPermissions = async () => {
        await loadPermissions()
    }

    return (
        <PermissionContext.Provider value={{
            permissions,
            loading,
            hasPermission,
            getTablePermissions,
            refreshPermissions
        }}>
            {children}
        </PermissionContext.Provider>
    )
}

export function usePermissions() {
    const context = useContext(PermissionContext)
    if (context === undefined) {
        throw new Error('usePermissions must be used within a PermissionProvider')
    }
    return context
}
