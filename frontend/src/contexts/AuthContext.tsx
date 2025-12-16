import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'

interface User {
    userId: string
    username: string
    name: string
    roleIds?: string[]
    createdAt: string
    updatedAt: string
    entityType: string
}

interface AuthContextType {
    isAuthenticated: boolean
    user: User | null
    loading: boolean
    login: (userData: User, token: string) => void
    logout: () => void
    checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useAuth()

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuthContext() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider')
    }
    return context
}