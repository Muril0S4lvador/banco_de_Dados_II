import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuthContext } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './components/Login'
import Home from './components/Home'
import Profile from './components/Profile'
import Settings from './components/Settings'
import Roles from './components/Roles'
import Users from './components/Users'
import Table from './components/Table'
import TableView from './components/TableView'
import TableItemForm from './components/TableItemForm'

function AppContent() {
    const { isAuthenticated, login, logout } = useAuthContext()

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
                            <Home onLogout={logout} />
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

                <Route
                    path="/table"
                    element={
                        <ProtectedRoute>
                            <Table />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/table/:tableName"
                    element={
                        <ProtectedRoute>
                            <TableView />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/table/:tableName/:itemId"
                    element={
                        <ProtectedRoute>
                            <TableItemForm />
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
