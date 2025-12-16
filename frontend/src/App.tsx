import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuthContext } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './components/Login'
import Home from './components/Home'
import Profile from './components/Profile'
import Settings from './components/Settings'
import Roles from './components/Roles'
import Users from './components/Users'

function AppContent() {
    const { isAuthenticated, user, login, logout } = useAuthContext()

    const handleLoginSuccess = (userData: any, token: string) => {
        login(userData, token)
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Rota pública - Login */}
                <Route
                    path="/login"
                    element={
                        isAuthenticated ?
                            <Navigate to="/home" replace /> :
                            <Login onLoginSuccess={handleLoginSuccess} />
                    }
                />

                {/* Rotas privadas */}
                <Route
                    path="/home"
                    element={
                        <ProtectedRoute>
                            <Home user={user} onLogout={logout} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <Settings />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/roles"
                    element={
                        <ProtectedRoute>
                            <Roles />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/users"
                    element={
                        <ProtectedRoute>
                            <Users />
                        </ProtectedRoute>
                    }
                />

                {/* Rota raiz - redireciona para home se autenticado, senão para login */}
                <Route
                    path="/"
                    element={
                        <Navigate to={isAuthenticated ? "/home" : "/login"} replace />
                    }
                />

                {/* Rota 404 - qualquer rota não encontrada */}
                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />
            </Routes>
        </BrowserRouter>
    )
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    )
}

export default App
