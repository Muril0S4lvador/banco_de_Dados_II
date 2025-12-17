import { useParams, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import Header from './Header'
import { ArrowLeft, Trash2, Edit, Save, X, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '../lib/axios'
import './TableView.css'

interface Permission {
    tableName: string
    allowedView: boolean
    allowedEdit: boolean
    allowedDelete: boolean
}

interface Role {
    roleId: string
    name: string
    description: string
    type: string
    isCustom: boolean
    permissions: Permission[]
    createdAt: string
    updatedAt?: string
}

function RoleView() {
    const { roleId } = useParams<{ roleId: string }>()
    const { logout } = useAuthContext()
    const navigate = useNavigate()

    const [role, setRole] = useState<Role | null>(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editedRole, setEditedRole] = useState<Role | null>(null)
    const [newTableName, setNewTableName] = useState('')
    const [availableTables, setAvailableTables] = useState<string[]>([])

    useEffect(() => {
        if (roleId) {
            loadRole()
            loadAvailableTables()
        }
    }, [roleId])

    const loadRole = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/role/${roleId}`)
            setRole(response.data.data)
            setEditedRole(response.data.data)
        } catch (error: any) {
            console.error('Erro ao carregar role:', error)
            alert('Erro ao carregar role: ' + (error.response?.data?.error || error.message))
        } finally {
            setLoading(false)
        }
    }

    const loadAvailableTables = async () => {
        try {
            const response = await api.get('/tables/names')
            setAvailableTables(response.data.data)
        } catch (error: any) {
            console.error('Erro ao carregar tabelas:', error)
        }
    }

    const handleEditRole = () => {
        setIsEditing(true)
        setEditedRole(role)
    }

    const handleAddTable = () => {
        if (!editedRole) return

        if (!newTableName.trim()) {
            alert('Por favor, digite o nome da tabela')
            return
        }

        if (editedRole.permissions.some(p => p.tableName.toLowerCase() === newTableName.trim().toLowerCase())) {
            alert('Esta tabela já está na lista')
            return
        }

        const newPermissions = [...editedRole.permissions, {
            tableName: newTableName.trim(),
            allowedView: false,
            allowedEdit: false,
            allowedDelete: false
        }]
        setEditedRole({ ...editedRole, permissions: newPermissions })
        setNewTableName('')
    }

    const handleRemoveTable = (index: number) => {
        if (!editedRole) return
        const newPermissions = editedRole.permissions.filter((_, i) => i !== index)
        setEditedRole({ ...editedRole, permissions: newPermissions })
    }

    const handleSaveRole = async () => {
        if (!editedRole || !roleId) return

        try {
            const payload = {
                name: editedRole.name,
                description: editedRole.description,
                permissions: editedRole.permissions.map(p => ({
                    table: p.tableName,
                    select: p.allowedView,
                    insert: p.allowedEdit,
                    delete: p.allowedDelete
                }))
            }

            await api.put(`/role/${roleId}`, payload)
            alert('Role atualizada com sucesso!')
            setIsEditing(false)
            loadRole()
        } catch (error: any) {
            console.error('Erro ao salvar role:', error)
            alert('Erro ao salvar role: ' + (error.response?.data?.error || error.message))
        }
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setEditedRole(role)
    }

    const handlePermissionChange = (index: number, field: string, value: boolean) => {
        if (!editedRole) return
        const newPermissions = [...editedRole.permissions]
        newPermissions[index] = { ...newPermissions[index], [field]: value }
        setEditedRole({ ...editedRole, permissions: newPermissions })
    }

    const handleDeleteRole = async () => {
        if (window.confirm(`Tem certeza que deseja deletar a role "${role?.name}"?`)) {
            try {
                await api.delete(`/role/${roleId}`)
                alert('Role deletada com sucesso!')
                navigate('/roles')
            } catch (error: any) {
                console.error('Erro ao deletar role:', error)
                alert('Erro ao deletar role: ' + (error.response?.data?.error || error.message))
            }
        }
    }

    if (loading) {
        return (
            <div className="table-view-page">
                <Header onLogout={logout} />
                <div className="table-view-container">
                    <div className="no-items">
                        <p>Carregando role...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!role) {
        return (
            <div className="table-view-page">
                <Header onLogout={logout} />
                <div className="table-view-container">
                    <div className="no-items">
                        <p>Role não encontrada</p>
                        <button className="btn-create-first" onClick={() => navigate('/roles')}>
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
                                onClick={() => navigate('/roles')}
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
                            {isEditing && editedRole ? (
                                <input
                                    type="text"
                                    value={editedRole.name}
                                    onChange={(e) => setEditedRole({ ...editedRole, name: e.target.value })}
                                    style={{
                                        fontSize: '32px',
                                        fontWeight: 'bold',
                                        border: '2px solid #cbd5e0',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        width: '100%',
                                        maxWidth: '500px'
                                    }}
                                />
                            ) : (
                                <h1>{role.name}</h1>
                            )}
                        </div>
                        {isEditing && editedRole ? (
                            <textarea
                                value={editedRole.description}
                                onChange={(e) => setEditedRole({ ...editedRole, description: e.target.value })}
                                rows={2}
                                style={{
                                    fontSize: '14px',
                                    color: '#718096',
                                    border: '2px solid #cbd5e0',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    width: '100%',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        ) : (
                            <p>{role.description}</p>
                        )}
                    </div>
                    {role.isCustom && !isEditing && (
                        <div className="table-actions">
                            <button className="btn-create-item" onClick={handleEditRole}>
                                <Edit size={20} />
                                Editar Role
                            </button>
                            <button className="btn-delete-table" onClick={handleDeleteRole}>
                                <Trash2 size={20} />
                                Deletar Role
                            </button>
                        </div>
                    )}
                </div>

                <div className="table-view-content">
                    <div style={{ padding: '30px' }}>
                        <div style={{ marginBottom: '30px' }}>
                            <h3 style={{ fontSize: '18px', color: '#2d3748', marginBottom: '10px' }}>
                                Informações
                            </h3>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#718096' }}>ID:</span>
                                    <span style={{ fontWeight: 500 }}>{role.roleId}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#718096' }}>Tipo:</span>
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
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#718096' }}>Criada em:</span>
                                    <span style={{ fontWeight: 500 }}>
                                        {new Date(role.createdAt).toLocaleString('pt-BR')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '18px', color: '#2d3748', marginBottom: '15px' }}>
                                Permissões ({(isEditing ? editedRole?.permissions.length : role.permissions.length) || 0} tabela(s))
                            </h3>
                            {isEditing && (
                                <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <select
                                        value={newTableName}
                                        onChange={(e) => setNewTableName(e.target.value)}
                                        style={{
                                            padding: '10px 16px',
                                            border: '1px solid #cbd5e0',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            flex: 1,
                                            maxWidth: '300px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="">Selecione uma tabela</option>
                                        {availableTables
                                            .filter(table => !editedRole?.permissions.some(p => p.tableName === table))
                                            .map(table => (
                                                <option key={table} value={table}>{table}</option>
                                            ))
                                        }
                                    </select>
                                    <button
                                        type="button"
                                        onClick={handleAddTable}
                                        disabled={!newTableName}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '10px 20px',
                                            background: newTableName ? '#FF9900' : '#cbd5e0',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            cursor: newTableName ? 'pointer' : 'not-allowed',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        <Plus size={18} />
                                        Adicionar Tabela
                                    </button>
                                </div>
                            )}
                            {role.type === 'ADMIN' ? (
                                <p style={{ color: '#718096', fontStyle: 'italic' }}>
                                    Administradores têm acesso total a todas as tabelas
                                </p>
                            ) : role.permissions.length === 0 ? (
                                <p style={{ color: '#718096', fontStyle: 'italic' }}>
                                    Nenhuma permissão configurada
                                </p>
                            ) : (
                                <div className="table-wrapper">
                                    <table className="items-table">
                                        <thead>
                                            <tr>
                                                <th>Tabela</th>
                                                <th style={{ textAlign: 'center' }}>View (Select)</th>
                                                <th style={{ textAlign: 'center' }}>Edit (Insert)</th>
                                                <th style={{ textAlign: 'center' }}>Delete</th>
                                                {isEditing && <th style={{ width: '80px', textAlign: 'center' }}>Ações</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(isEditing ? editedRole?.permissions : role.permissions)?.map((perm: any, index: number) => (
                                                <tr key={index}>
                                                    <td style={{ fontWeight: 600 }}>{perm.tableName}</td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {isEditing ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={perm.allowedView}
                                                                onChange={(e) => handlePermissionChange(index, 'allowedView', e.target.checked)}
                                                                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                                                            />
                                                        ) : (
                                                            <span style={{
                                                                color: perm.allowedView ? '#48bb78' : '#cbd5e0',
                                                                fontWeight: 600
                                                            }}>
                                                                {perm.allowedView ? '✓' : '✗'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {isEditing ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={perm.allowedEdit}
                                                                onChange={(e) => handlePermissionChange(index, 'allowedEdit', e.target.checked)}
                                                                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                                                            />
                                                        ) : (
                                                            <span style={{
                                                                color: perm.allowedEdit ? '#48bb78' : '#cbd5e0',
                                                                fontWeight: 600
                                                            }}>
                                                                {perm.allowedEdit ? '✓' : '✗'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {isEditing ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={perm.allowedDelete}
                                                                onChange={(e) => handlePermissionChange(index, 'allowedDelete', e.target.checked)}
                                                                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                                                            />
                                                        ) : (
                                                            <span style={{
                                                                color: perm.allowedDelete ? '#48bb78' : '#cbd5e0',
                                                                fontWeight: 600
                                                            }}>
                                                                {perm.allowedDelete ? '✓' : '✗'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    {isEditing && (
                                                        <td style={{ textAlign: 'center' }}>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveTable(index)}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    color: '#e53e3e',
                                                                    cursor: 'pointer',
                                                                    padding: '4px',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                                title="Remover tabela"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {isEditing && role.isCustom && (
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
                                >
                                    <X size={20} />
                                    Cancelar
                                </button>
                                <button className="btn-create-item" onClick={handleSaveRole}>
                                    <Save size={20} />
                                    Salvar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RoleView
