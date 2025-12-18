import { useParams, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import Header from './Header'
import { ArrowLeft, Key, Edit, Save, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { userService, User } from '../services/userService'
import { roleService, Role } from '../services/roleService'
import './TableView.css'

function UserView() {
    const { userId } = useParams<{ userId: string }>()
    const { logout } = useAuthContext()
    const navigate = useNavigate()

    const [user, setUser] = useState<User | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editedUser, setEditedUser] = useState<User | null>(null)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (userId) {
            loadUser()
            loadRoles()
        }
    }, [userId])

    const loadUser = async () => {
        if (!userId) return

        try {
            setLoading(true)
            const data = await userService.getUser(userId)
            setUser(data)
            setEditedUser(data)
        } catch (error) {
            console.error('Erro ao carregar usuário:', error)
            alert('Erro ao carregar usuário.')
        } finally {
            setLoading(false)
        }
    }

    const loadRoles = async () => {
        try {
            const data = await roleService.listRoles()
            setRoles(data)
        } catch (error) {
            console.error('Erro ao carregar roles:', error)
        }
    }

    const handleEditUser = () => {
        setIsEditing(true)
        setEditedUser(user)
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setEditedUser(user)
    }

    const handleSaveUser = async () => {
        if (!editedUser || !userId) return

        if (!editedUser.name.trim()) {
            alert('O nome não pode estar vazio')
            return
        }

        if (!editedUser.username.trim()) {
            alert('O username não pode estar vazio')
            return
        }

        if (editedUser.roleIds.length === 0) {
            alert('O usuário deve ter pelo menos uma role')
            return
        }

        try {
            setSaving(true)
            const updateData: any = {
                username: editedUser.username,
                name: editedUser.name
            }

            // Só envia roleIds se não for o admin
            if (userId !== 'user_admin_001') {
                updateData.roleIds = editedUser.roleIds
            }

            const updatedUser = await userService.updateUser(userId, updateData)
            setUser(updatedUser)
            setEditedUser(updatedUser)
            setIsEditing(false)
            alert('Usuário atualizado com sucesso!')
        } catch (error: any) {
            console.error('Erro ao salvar usuário:', error)
            const errorMessage = error.response?.data?.message || 'Erro ao salvar usuário. Tente novamente.'
            alert(errorMessage)
        } finally {
            setSaving(false)
        }
    }

    const handleRoleToggle = (roleId: string) => {
        if (!editedUser) return

        const newRoleIds = editedUser.roleIds.includes(roleId)
            ? editedUser.roleIds.filter(id => id !== roleId)
            : [...editedUser.roleIds, roleId]

        setEditedUser({ ...editedUser, roleIds: newRoleIds })
    }

    const handleChangePassword = async () => {
        if (!userId) return

        if (!newPassword || !confirmPassword) {
            alert('Por favor, preencha todos os campos')
            return
        }

        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem')
            return
        }

        if (newPassword.length < 6) {
            alert('A senha deve ter no mínimo 6 caracteres')
            return
        }

        try {
            await userService.changePassword(userId, { newPassword })
            alert('Senha alterada com sucesso!')
            setShowPasswordModal(false)
            setNewPassword('')
            setConfirmPassword('')
        } catch (error: any) {
            console.error('Erro ao alterar senha:', error)
            const errorMessage = error.response?.data?.message || 'Erro ao alterar senha. Tente novamente.'
            alert(errorMessage)
        }
    }

    if (loading) {
        return (
            <div className="table-view-page">
                <Header onLogout={logout} />
                <div className="table-view-container">
                    <div className="no-items">
                        <p>Carregando...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="table-view-page">
                <Header onLogout={logout} />
                <div className="table-view-container">
                    <div className="no-items">
                        <p>Usuário não encontrado</p>
                        <button className="btn-create-first" onClick={() => navigate('/users')}>
                            Voltar para lista
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="table-view-page">
            <Header onLogout={logout} />
            <div className="table-view-container">
                <div className="table-view-header">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <button
                                onClick={() => navigate('/users')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#718096'
                                }}
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <h1>{user.userId}</h1>
                        </div>
                    </div>
                    {!isEditing && (
                        <div className="table-actions">
                            <button className="btn-create-item" onClick={handleEditUser}>
                                <Edit size={20} />
                                Editar Usuário
                            </button>
                        </div>
                    )}
                </div>

                <div className="table-view-content">
                    <div style={{ padding: '30px' }}>
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', color: '#2d3748' }}>
                                    Informações do Usuário
                                </h3>
                                <button
                                    className="btn-create-item"
                                    onClick={() => setShowPasswordModal(true)}
                                    style={{ fontSize: '14px', padding: '10px 16px' }}
                                >
                                    <Key size={18} />
                                    Alterar Senha
                                </button>
                            </div>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#718096' }}>Nome:</span>
                                    {isEditing && editedUser ? (
                                        <input
                                            type="text"
                                            value={editedUser.name}
                                            onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                                            style={{
                                                padding: '8px 12px',
                                                border: '1px solid #cbd5e0',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                width: '300px'
                                            }}
                                        />
                                    ) : (
                                        <span style={{ fontWeight: 500 }}>{user.name}</span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#718096' }}>Username:</span>
                                    {isEditing && editedUser ? (
                                        <input
                                            type="text"
                                            value={editedUser.username}
                                            onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
                                            style={{
                                                padding: '8px 12px',
                                                border: '1px solid #cbd5e0',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                width: '300px'
                                            }}
                                        />
                                    ) : (
                                        <span style={{ fontWeight: 500 }}>{user.username}</span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#718096' }}>Criado em:</span>
                                    <span style={{ fontWeight: 500 }}>
                                        {new Date(user.createdAt).toLocaleString('pt-BR')}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#718096' }}>Atualizado em:</span>
                                    <span style={{ fontWeight: 500 }}>
                                        {user.updatedAt ? new Date(user.updatedAt).toLocaleString('pt-BR') : '-'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#718096' }}>Tipo:</span>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        backgroundColor: user.userType === 'admin' ? '#e8f5e9' : '#e3f2fd',
                                        color: user.userType === 'admin' ? '#2e7d32' : '#1976d2'
                                    }}>
                                        {user.userType === 'admin' ? 'ADMINISTRADOR' : 'USUÁRIO'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#718096' }}>Roles:</span>
                                    {isEditing && editedUser && userId !== 'user_admin_001' ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                            {roles.map((role) => (
                                                <label
                                                    key={role.roleId}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        cursor: 'pointer',
                                                        padding: '6px 12px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #cbd5e0',
                                                        backgroundColor: editedUser.roleIds.includes(role.roleId) ? '#fff3e0' : 'white'
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={editedUser.roleIds.includes(role.roleId)}
                                                        onChange={() => handleRoleToggle(role.roleId)}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                    <span style={{ fontSize: '14px' }}>{role.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                            {user.roleIds.map((roleId) => {
                                                const role = roles.find(r => r.roleId === roleId)
                                                return (
                                                    <span
                                                        key={roleId}
                                                        style={{
                                                            padding: '4px 12px',
                                                            borderRadius: '12px',
                                                            fontSize: '12px',
                                                            fontWeight: 600,
                                                            backgroundColor: '#fff3e0',
                                                            color: '#f57c00'
                                                        }}
                                                    >
                                                        {role?.name || roleId}
                                                    </span>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'flex-end',
                                marginTop: '30px',
                                paddingTop: '20px',
                                borderTop: '1px solid #e2e8f0'
                            }}>
                                <button
                                    className="btn-delete-table"
                                    onClick={handleCancelEdit}
                                    style={{ background: '#718096' }}
                                    disabled={saving}
                                >
                                    <X size={20} />
                                    Cancelar
                                </button>
                                <button className="btn-create-item" onClick={handleSaveUser} disabled={saving}>
                                    <Save size={20} />
                                    {saving ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Alterar Senha */}
            {showPasswordModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '30px',
                        maxWidth: '500px',
                        width: '90%',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
                    }}>
                        <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#2d3748' }}>
                            Alterar Senha
                        </h2>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#4a5568', fontWeight: 500 }}>
                                Nova Senha
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #cbd5e0',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#4a5568', fontWeight: 500 }}>
                                Confirmar Senha
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Digite a senha novamente"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #cbd5e0',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false)
                                    setNewPassword('')
                                    setConfirmPassword('')
                                }}
                                style={{
                                    padding: '10px 20px',
                                    background: '#718096',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleChangePassword}
                                className="btn-create-item"
                                style={{ fontSize: '14px', padding: '10px 20px' }}
                            >
                                Salvar Nova Senha
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UserView
