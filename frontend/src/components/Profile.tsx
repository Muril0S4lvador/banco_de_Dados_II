import { useState } from 'react'
import { useAuthContext } from '../contexts/AuthContext'
import Header from './Header'
import './Profile.css'

function Profile() {
    const { user, logout } = useAuthContext()

    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault()

        // Validações
        if (!newPassword) {
            alert('Por favor, digite a nova senha')
            return
        }

        if (newPassword.length < 6) {
            alert('A nova senha deve ter no mínimo 6 caracteres')
            return
        }

        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem')
            return
        }

        // Preparar dados para envio (futuramente será enviado para a API)
        const passwordData = {
            userId: user?.userId,
            newPassword
        }

        console.log('Troca de senha:', passwordData)
        alert('Senha alterada com sucesso! (Frontend apenas)')

        // Resetar formulário
        setNewPassword('')
        setConfirmPassword('')
        setShowNewPassword(false)
        setShowConfirmPassword(false)
    }

    return (
        <div className="profile-page">
            <Header onLogout={logout} />
            <div className="profile-container">
                <div className="profile-content">
                    <h2>Informações do Perfil</h2>
                    <div className="profile-info">
                        <p><strong>User ID:</strong> {user?.userId}</p>
                        <p><strong>Username:</strong> {user?.username}</p>
                        <p><strong>Nome:</strong> {user?.name}</p>
                        <p><strong>Roles:</strong> {user?.roleIds?.join(', ') || 'Nenhum'}</p>
                    </div>
                </div>

                <div className="password-change-section">
                    <h2>Trocar Senha</h2>
                    <form onSubmit={handleChangePassword} className="password-form">
                        <div className="form-group">
                            <label htmlFor="newPassword">Nova Senha *</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    title={showNewPassword ? "Ocultar senha" : "Mostrar senha"}
                                >
                                    {showNewPassword ? (
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
                            <label htmlFor="confirmPassword">Confirmar Nova Senha *</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Digite a nova senha novamente"
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

                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={() => {
                                setNewPassword('')
                                setConfirmPassword('')
                                setShowNewPassword(false)
                                setShowConfirmPassword(false)
                            }}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn-submit">
                                Alterar Senha
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Profile
