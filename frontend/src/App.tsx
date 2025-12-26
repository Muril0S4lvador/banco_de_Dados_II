import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuthContext } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './components/Login'
import Home from './components/Home'
import Profile from './components/Profile'
import Settings from './components/Settings'
import RolesList from './components/RolesList'
import RoleForm from './components/RoleForm'
import RoleView from './components/RoleView'
import Users from './components/Users'
import UsersList from './components/UsersList'
import UserView from './components/UserView'
import Table from './components/Table'
import TableItemForm from './components/TableItemForm'
import AccountList from './components/AccountList'
import AccountForm from './components/AccountForm'
import BorrowerList from './components/BorrowerList'
import BorrowerForm from './components/BorrowerForm'
import BranchList from './components/BranchList'
import BranchForm from './components/BranchForm'
import CustomerList from './components/CustomerList'
import CustomerForm from './components/CustomerForm'
import LoanList from './components/LoanList'
import LoanForm from './components/LoanForm'
import DepositorList from './components/DepositorList'
import DepositorForm from './components/DepositorForm'

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
                            <RolesList />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/role"
                    element={
                        <ProtectedRoute>
                            <RoleForm />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/role/:roleId"
                    element={
                        <ProtectedRoute>
                            <RoleView />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/users"
                    element={
                        <ProtectedRoute>
                            <UsersList />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/user"
                    element={
                        <ProtectedRoute>
                            <Users />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/user/:userId"
                    element={
                        <ProtectedRoute>
                            <UserView />
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

                {/* <Route
                    path="/table/:tableName"
                    element={
                        <ProtectedRoute>
                            <TableView />
                        </ProtectedRoute>
                    }
                /> */}

                {/* Rotas de formulários específicos para cada entidade */}
                <Route
                    path="/table/account/:itemId"
                    element={
                        <ProtectedRoute>
                            <AccountForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/table/branch/:itemId"
                    element={
                        <ProtectedRoute>
                            <BranchForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/table/borrower/:itemId"
                    element={
                        <ProtectedRoute>
                            <BorrowerForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/table/customer/:itemId"
                    element={
                        <ProtectedRoute>
                            <CustomerForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/table/loan/:itemId"
                    element={
                        <ProtectedRoute>
                            <LoanForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/table/depositor/:itemId"
                    element={
                        <ProtectedRoute>
                            <DepositorForm />
                        </ProtectedRoute>
                    }
                />

                {/* Rota genérica para outras tabelas */}
                <Route
                    path="/table/:tableName/:itemId"
                    element={
                        <ProtectedRoute>
                            <TableItemForm />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/table/account"
                    element={
                        <ProtectedRoute>
                            <AccountList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/table/borrower"
                    element={
                        <ProtectedRoute>
                            <BorrowerList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/table/branch"
                    element={
                        <ProtectedRoute>
                            <BranchList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/table/customer"
                    element={
                        <ProtectedRoute>
                            <CustomerList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/table/loan"
                    element={
                        <ProtectedRoute>
                            <LoanList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/table/depositor"
                    element={
                        <ProtectedRoute>
                            <DepositorList />
                        </ProtectedRoute>
                    }
                />

                {/* Aliases para tabelas conhecidas (case-insensitive) */}
                <Route path="/table/Account" element={<Navigate to="/table/account" replace />} />
                <Route path="/table/Branch" element={<Navigate to="/table/branch" replace />} />
                <Route path="/table/Borrower" element={<Navigate to="/table/borrower" replace />} />
                <Route path="/table/Customer" element={<Navigate to="/table/customer" replace />} />
                <Route path="/table/Loan" element={<Navigate to="/table/loan" replace />} />
                <Route path="/table/Depositor" element={<Navigate to="/table/depositor" replace />} />

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
