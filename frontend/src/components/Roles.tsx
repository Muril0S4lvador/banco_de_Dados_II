import { useState } from 'react'
import { useAuthContext } from '../contexts/AuthContext'
import Header from './Header'
import './Roles.css'

interface Permission {
    table: string
    select: boolean
    insert: boolean
    delete: boolean
}

const TABLES = [
    'Users',
    'Tokens',
    'Roles',
    'Permissions',
    'branch',
    'customer',
    'account',
    'loan',
    'borrower',
    'depositor'
]

function Roles() {
    const { logout } = useAuthContext()

    const [roleName, setRoleName] = useState('')
    const [roleDescription, setRoleDescription] = useState('')
    const [permissions, setPermissions] = useState<Permission[]>(
        TABLES.map(table => ({
            table,
            select: false,
            insert: false,
            delete: false
        }))
    )

    const handlePermissionChange = (tableIndex: number, permission: 'select' | 'insert' | 'delete') => {
        setPermissions(prev => {
            const updated = [...prev]
            updated[tableIndex] = {
                ...updated[tableIndex],
                [permission]: !updated[tableIndex][permission]
            }
            return updated
        })
    }

    const handleSelectAll = (permission: 'select' | 'insert' | 'delete') => {
        const allChecked = permissions.every(p => p[permission])
        setPermissions(prev =>
            prev.map(p => ({
                ...p,
                [permission]: !allChecked
            }))
        )
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Validações
        if (!roleName.trim()) {
            alert('Por favor, preencha o nome da role')
            return
        }

        if (!roleDescription.trim()) {
            alert('Por favor, preencha a descrição da role')
            return
        }

        // Preparar dados para envio (futuramente será enviado para a API)
        const roleData = {
            name: roleName,
            description: roleDescription,
            permissions: permissions.filter(p => p.select || p.insert || p.delete)
        }

        console.log('Role criada:', roleData)
        alert('Role criada com sucesso! (Frontend apenas)')

        // Resetar formulário
        setRoleName('')
        setRoleDescription('')
        setPermissions(TABLES.map(table => ({
            table,
            select: false,
            insert: false,
            delete: false
        })))
    }

    return (
        <div className="roles-page">
            <Header onLogout={logout} />
            <div className="roles-container">
                <div className="roles-header">
                    <h1>Cadastrar Nova Role</h1>
                    <p>Preencha os campos abaixo para criar uma nova role no sistema</p>
                </div>

                <form onSubmit={handleSubmit} className="role-form">
                    <div className="form-section">
                        <div className="form-group">
                            <label htmlFor="roleName">Nome da Role *</label>
                            <input
                                type="text"
                                id="roleName"
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}
                                placeholder="Ex: Gerente, Operador, Auditor"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="roleDescription">Descrição *</label>
                            <textarea
                                id="roleDescription"
                                value={roleDescription}
                                onChange={(e) => setRoleDescription(e.target.value)}
                                placeholder="Descreva as responsabilidades e propósito desta role"
                                rows={4}
                                required
                            />
                        </div>
                    </div>

                    <div className="permissions-section">
                        <h2>Permissões</h2>
                        <p className="permissions-subtitle">
                            Selecione as permissões de acesso para cada tabela
                        </p>

                        <div className="permissions-table-wrapper">
                            <table className="permissions-table">
                                <thead>
                                    <tr>
                                        <th className="table-column">Tabela</th>
                                        <th className="permission-column">
                                            <div className="header-with-checkbox">
                                                <span>Select</span>
                                                <input
                                                    type="checkbox"
                                                    onChange={() => handleSelectAll('select')}
                                                    checked={permissions.every(p => p.select)}
                                                    title="Selecionar todos"
                                                />
                                            </div>
                                        </th>
                                        <th className="permission-column">
                                            <div className="header-with-checkbox">
                                                <span>Insert</span>
                                                <input
                                                    type="checkbox"
                                                    onChange={() => handleSelectAll('insert')}
                                                    checked={permissions.every(p => p.insert)}
                                                    title="Selecionar todos"
                                                />
                                            </div>
                                        </th>
                                        <th className="permission-column">
                                            <div className="header-with-checkbox">
                                                <span>Delete</span>
                                                <input
                                                    type="checkbox"
                                                    onChange={() => handleSelectAll('delete')}
                                                    checked={permissions.every(p => p.delete)}
                                                    title="Selecionar todos"
                                                />
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {permissions.map((permission, index) => (
                                        <tr key={permission.table}>
                                            <td className="table-name">{permission.table}</td>
                                            <td className="checkbox-cell">
                                                <input
                                                    type="checkbox"
                                                    checked={permission.select}
                                                    onChange={() => handlePermissionChange(index, 'select')}
                                                />
                                            </td>
                                            <td className="checkbox-cell">
                                                <input
                                                    type="checkbox"
                                                    checked={permission.insert}
                                                    onChange={() => handlePermissionChange(index, 'insert')}
                                                />
                                            </td>
                                            <td className="checkbox-cell">
                                                <input
                                                    type="checkbox"
                                                    checked={permission.delete}
                                                    onChange={() => handlePermissionChange(index, 'delete')}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => {
                            setRoleName('')
                            setRoleDescription('')
                            setPermissions(TABLES.map(table => ({
                                table,
                                select: false,
                                insert: false,
                                delete: false
                            })))
                        }}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-submit">
                            Criar Role
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Roles
