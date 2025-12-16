import { ReactNode, useEffect } from 'react'
import { useAuthContext } from '../contexts/AuthContext'
import { isPrivateRoute } from '../config/routes'

interface ProtectedRouteProps {
    children: ReactNode
    currentPath?: string
}

function ProtectedRoute({ children, currentPath = window.location.pathname }: ProtectedRouteProps) {
    const { isAuthenticated, loading } = useAuthContext()

    useEffect(() => {
        // Se a rota é privada e o usuário não está autenticado, redireciona para login
        if (!loading && isPrivateRoute(currentPath) && !isAuthenticated) {
            window.location.href = '/login'
        }
    }, [isAuthenticated, loading, currentPath])

    // Mostra loading enquanto verifica autenticação
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#232f3e',
                color: 'white',
                fontSize: '18px'
            }}>
                Carregando...
            </div>
        )
    }

    // Se a rota é privada e não está autenticado, não renderiza (vai redirecionar)
    if (isPrivateRoute(currentPath) && !isAuthenticated) {
        return null
    }

    // Caso contrário, renderiza o conteúdo
    return <>{children}</>
}

export default ProtectedRoute