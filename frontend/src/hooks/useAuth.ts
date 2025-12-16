import { useState, useEffect } from 'react'
import api from '../lib/axios'

interface User {
    userId: string
    username: string
    name: string
    roleIds?: string[]
    createdAt: string
    updatedAt: string
    entityType: string
}

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const token = localStorage.getItem('token')

        if (!token) {
            setLoading(false)
            return
        }

        try {
            const response = await api.get('/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.data.success) {
                setUser(response.data.data);
                setIsAuthenticated(true);
            } else {
                logout();
            }
        } catch (error) {
            logout();
        } finally {
            setLoading(false)
        }
    }

const login = (userData: User, token: string) => {
    localStorage.setItem('token', token)
    setUser(userData)
    setIsAuthenticated(true)
}

const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
}

return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuth
}


}