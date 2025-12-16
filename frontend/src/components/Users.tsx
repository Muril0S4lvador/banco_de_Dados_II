import { useState } from 'react'
import { useAuthContext } from '../contexts/AuthContext'
import Header from './Header'
import './Users.css'

// Mock de roles - futuramente será puxado da API
const MOCK_ROLES = [
    { roleId: 'role_1', name: 'Administrator' },
    { roleId: 'role_2', name: 'Manager' },
    { roleId: 'role_3', name: 'Operator' },
    { roleId: 'role_4', name: 'Viewer' },
]

function Users() {
    const { logout } = useAuthContext()

    const [username, setUsername] = useState('')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [selectedRoles, setSelectedRoles] = useState<string[]>([])
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleRoleToggle = (roleId: string) => {
        setSelectedRoles(prev => {
            if (prev.includes(roleId)) {
                return prev.filter(id => id !== roleId)
            } else {
                return [...prev, roleId]
            }
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Validações
        if (!username.trim()) {
            alert('Por favor, preencha o username')
            return
        }

        if (!name.trim()) {
            alert('Por favor, preencha o nome')
            return
        }

        if (!password) {
            alert('Por favor, preencha a senha')
            return
        }

        if (password !== confirmPassword) {
            alert('As senhas não coincidem')
            return
        }

        if (password.length < 6) {
            alert('A senha deve ter no mínimo 6 caracteres')
            return
        }

        if (selectedRoles.length === 0) {
            alert('Por favor, selecione pelo menos uma role')
            return
        }

        // Preparar dados para envio (futuramente será enviado para a API)
        const userData = {
            username,
            name,
            password,
            roleIds: selectedRoles
        }

        console.log('Usuário criado:', userData)
        alert('Usuário criado com sucesso! (Frontend apenas)')

        // Resetar formulário
        setUsername('')
        setName('')
        setPassword('')
        setConfirmPassword('')
        setSelectedRoles([])
        setShowPassword(false)
        setShowConfirmPassword(false)
    }

    return (
        <div className="users-page">
            <Header onLogout={logout} />
            <div className="users-container">
                <div className="users-header">
                    <h1>Cadastrar Novo Usuário</h1>
                    <p>Preencha os campos abaixo para criar um novo usuário no sistema</p>
                </div>

                <form onSubmit={handleSubmit} className="user-form">
                    <div className="form-section">
                        <div className="form-group">
                            <label htmlFor="username">Username *</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Ex: joao.silva"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="name">Nome Completo *</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: João da Silva"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="password">Senha *</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Mínimo 6 caracteres"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                        title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                    >
                                        {showPassword ? (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                <line x1="1" y1="1" x2="23" y2="23"></line>
                                            </svg>
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirmar Senha *</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Digite a senha novamente"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        title={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                                    >
                                        {showConfirmPassword ? (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                <line x1="1" y1="1" x2="23" y2="23"></line>
                                            </svg>
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="roles-section">
                        <h2>Roles</h2>
                        <p className="roles-subtitle">
                            Selecione as roles que serão atribuídas ao usuário
                        </p>

                        <div className="roles-grid">
                            {MOCK_ROLES.map((role) => (
                                <div
                                    key={role.roleId}
                                    className={`role-card ${selectedRoles.includes(role.roleId) ? 'selected' : ''}`}
                                    onClick={() => handleRoleToggle(role.roleId)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedRoles.includes(role.roleId)}
                                        onChange={() => handleRoleToggle(role.roleId)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <span className="role-name">{role.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => {
                            setUsername('')
                            setName('')
                            setPassword('')
                            setConfirmPassword('')
                            setSelectedRoles([])
                            setShowPassword(false)
                            setShowConfirmPassword(false)
                        }}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-submit">
                            Criar Usuário
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Users
