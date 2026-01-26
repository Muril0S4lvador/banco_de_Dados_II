import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import Header from './Header'
import { Plus, Trash2 } from 'lucide-react'
import api from '../lib/axios'
import './TableView.css'

interface Role {
    roleId: string
    name: string
    description: string
    type: string
    permissions: any[]
    isCustom: boolean
}

function RolesList() {
    const { logout } = useAuthContext()
    const navigate = useNavigate()
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadRoles()
    }, [])

    const loadRoles = async () => {
        try {
            setLoading(true)
            const response = await api.get('/role')
            setRoles(response.data.data)
        } catch (error: any) {
            console.error('Erro ao carregar roles:', error)
            alert('Erro ao carregar roles: ' + (error.response?.data?.error || error.message))
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteRole = async (roleId: string, roleName: string) => {
        if (window.confirm(`Tem certeza que deseja deletar a role "${roleName}"?`)) {
            try {
                await api.delete(`/role/${roleId}`)
                alert('Role deletada com sucesso!')
                loadRoles()
            } catch (error: any) {
                console.error('Erro ao deletar role:', error)
                alert('Erro ao deletar role: ' + (error.response?.data?.error || error.message))
            }
        }
    }

    const handleRowClick = (roleId: string) => {
        navigate(`/role/${roleId}`)
    }

    return (
        <div className="table-view-page">
            <Header onLogout={logout} />
            <div className="table-view-container">
                <div className="table-view-header">
                    <div>
                        <h1>Roles</h1>
                        <p>{roles.length} role(s) cadastrada(s)</p>
                    </div>
                    <div className="table-actions">
                        <button
                            className="btn-create-item"
                            onClick={() => navigate('/role')}
                        >
                            <Plus size={20} />
                            Criar Role
                        </button>
                    </div>
                </div>

                <div className="table-view-content">
                    {loading ? (
                        <div className="no-items">
                            <p>Carregando roles...</p>
                        </div>
                    ) : roles.length === 0 ? (
                        <div className="no-items">
                            <p>Nenhuma role cadastrada</p>
                            <button
                                className="btn-create-first"
                                onClick={() => navigate('/role')}
                            >
                                Criar Primeira Role
                            </button>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Descrição</th>
                                        <th>Tipo</th>
                                        <th>Permissões</th>
                                        <th className="actions-column">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.map((role) => (
                                        <tr key={role.roleId}>
                                            <td
                                                className="table-row-clickable"
                                                onClick={() => handleRowClick(role.roleId)}
                                                style={{ cursor: 'pointer', fontWeight: 600 }}
                                            >
                                                {role.name}
                                            </td>
                                            <td
                                                className="table-row-clickable"
                                                onClick={() => handleRowClick(role.roleId)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {role.description}
                                            </td>
                                            <td
                                                className="table-row-clickable"
                                                onClick={() => handleRowClick(role.roleId)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    backgroundColor: role.type === 'ADMIN' ? '#e3f2fd' : '#fff3e0',
                                                    color: role.type === 'ADMIN' ? '#1976d2' : '#f57c00'
                                                }}>
                                                    {role.type}
                                                </span>
                                            </td>
                                            <td
                                                className="table-row-clickable"
                                                onClick={() => handleRowClick(role.roleId)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {role.permissions?.length || 0} tabela(s)
                                            </td>
                                            <td className="actions-cell">
                                                <button
                                                    className="btn-delete-item"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDeleteRole(role.roleId, role.name)
                                                    }}
                                                    title="Deletar role"
                                                    disabled={!role.isCustom}
                                                    style={{
                                                        opacity: role.isCustom ? 1 : 0.5,
                                                        cursor: role.isCustom ? 'pointer' : 'not-allowed'
                                                    }}
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

export default RolesList
