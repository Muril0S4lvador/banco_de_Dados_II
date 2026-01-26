import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { ReactNode } from 'react'

interface AdminRouteProps {
    children: ReactNode
}

function AdminRoute({ children }: AdminRouteProps) {
    const { user, isAuthenticated } = useAuthContext()

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    // Verifica se o usuário tem a role 'admin'
    const isAdmin = user?.roleIds?.includes('admin')

    if (!isAdmin) {
        return <Navigate to="/home" replace />
    }

    return <>{children}</>
}

export default AdminRoute
