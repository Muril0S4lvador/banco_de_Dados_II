import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { usePermissions } from '../contexts/PermissionContext'
import Header from './Header'
import { accountService, Account } from '../services/accountService'
import './TableView.css'

export default function AccountList() {
    const { logout } = useAuthContext()
    const { hasPermission } = usePermissions()
    const navigate = useNavigate()
    const [items, setItems] = useState<Account[]>([])
    const [loading, setLoading] = useState(true)

    const canEdit = hasPermission('account', 'edit')
    const canDelete = hasPermission('account', 'delete')

    useEffect(() => {
        loadItems()
    }, [])

    const loadItems = async () => {
        try {
            setLoading(true)
            const data = await accountService.list()
            setItems(data)
        } catch (err) {
            console.error('Erro ao carregar contas:', err)
            alert('Erro ao carregar contas. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (item: Account) => {
        if (!item.account_number) return
        if (!confirm(`Deseja realmente excluir a conta ${item.account_number}?`)) return
        try {
            await accountService.delete(item.account_number)
            await loadItems()
            alert('Conta excluída com sucesso!')
        } catch (err: any) {
            console.error('Erro ao excluir conta:', err)
            alert(err.response?.data?.message || 'Erro ao excluir conta. Tente novamente.')
        }
    }

    const handleRowClick = (item: Account) => {
        if (!item.account_number) return
        navigate(`/table/account/${encodeURIComponent(item.account_number)}`)
    }

    const handleCreate = () => {
        navigate('/table/account/new')
    }

    return (
        <div className="table-view-page">
            <Header onLogout={logout} />
            <div className="table-view-container">
                <div className="table-view-header">
                    <div>
                        <h1>Contas</h1>
                        <p>{items.length} conta(s) cadastrada(s)</p>
                    </div>
                    {canEdit && (
                        <div className="table-actions">
                            <button className="btn-create-item" onClick={handleCreate}>
                                Criar Conta
                            </button>
                        </div>
                    )}
                </div>

                <div className="table-view-content">
                    {loading ? (
                        <div className="no-items"><p>Carregando contas...</p></div>
                    ) : items.length === 0 ? (
                        <div className="no-items">
                            <p>Nenhuma conta cadastrada</p>
                            {canEdit && (
                                <button className="btn-create-first" onClick={handleCreate}>
                                    Criar Primeira Conta
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Número da Conta</th>
                                        <th>Agência</th>
                                        <th>Saldo</th>
                                        {canDelete && <th className="actions-column">Ações</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.__id}>
                                            <td className="table-row-clickable" onClick={() => handleRowClick(item)}>{item.account_number ?? '-'}</td>
                                            <td className="table-row-clickable" onClick={() => handleRowClick(item)}>{item.branch_name ?? '-'}</td>
                                            <td className="table-row-clickable" onClick={() => handleRowClick(item)}>
                                                {item.balance !== undefined ? item.balance : '-'}
                                            </td>
                                            {canDelete && (
                                                <td className="actions-cell">
                                                    <button
                                                        className="btn-delete-item"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleDelete(item)
                                                        }}
                                                        title="Deletar conta"
                                                    >
                                                        Excluir
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
            </div>
        </div>
    )
}
