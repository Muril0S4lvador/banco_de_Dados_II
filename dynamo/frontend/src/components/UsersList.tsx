import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import Header from './Header'
import { Plus, Trash2 } from 'lucide-react'
import { userService, User } from '../services/userService'
import './TableView.css'

function UsersList() {
    const { logout } = useAuthContext()
    const navigate = useNavigate()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        try {
            setLoading(true)
            const data = await userService.listUsers()
            setUsers(data)
        } catch (error) {
            console.error('Erro ao carregar usuários:', error)
            alert('Erro ao carregar usuários. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (userId === 'user_admin_001') {
            alert('Não é permitido deletar o usuário administrador');
            return;
        }

        if (window.confirm(`Tem certeza que deseja deletar o usuário "${userName}"?`)) {
            try {
                await userService.deleteUser(userId)
                setUsers(users.filter(u => u.userId !== userId))
                alert('Usuário deletado com sucesso!')
            } catch (error: any) {
                console.error('Erro ao deletar usuário:', error)
                const errorMessage = error.response?.data?.message || 'Erro ao deletar usuário. Tente novamente.'
                alert(errorMessage)
            }
        }
    }

    const handleRowClick = (userId: string) => {
        navigate(`/user/${userId}`)
    }

    return (
        <div className="table-view-page">
            <Header onLogout={logout} />
            <div className="table-view-container">
                <div className="table-view-header">
                    <div>
                        <h1>Usuários</h1>
                        <p>{users.length} usuário(s) cadastrado(s)</p>
                    </div>
                    <div className="table-actions">
                        <button
                            className="btn-create-item"
                            onClick={() => navigate('/user')}
                        >
                            <Plus size={20} />
                            Criar Usuário
                        </button>
                    </div>
                </div>

                <div className="table-view-content">
                    {loading ? (
                        <div className="no-items">
                            <p>Carregando usuários...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="no-items">
                            <p>Nenhum usuário cadastrado</p>
                            <button
                                className="btn-create-first"
                                onClick={() => navigate('/user')}
                            >
                                Criar Primeiro Usuário
                            </button>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>User ID</th>
                                        <th>Username</th>
                                        <th>Nome</th>
                                        <th className="actions-column">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.userId}>
                                            <td
                                                className="table-row-clickable"
                                                onClick={() => handleRowClick(user.userId)}
                                                style={{ cursor: 'pointer', fontFamily: 'monospace', fontSize: '13px' }}
                                            >
                                                {user.userId}
                                            </td>
                                            <td
                                                className="table-row-clickable"
                                                onClick={() => handleRowClick(user.userId)}
                                                style={{ cursor: 'pointer', fontWeight: 600 }}
                                            >
                                                {user.username}
                                            </td>
                                            <td
                                                className="table-row-clickable"
                                                onClick={() => handleRowClick(user.userId)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {user.name}
                                            </td>
                                            <td className="actions-cell">
                                                <button
                                                    className="btn-delete-item"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDeleteUser(user.userId, user.name)
                                                    }}
                                                    title="Deletar usuário"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default UsersList
