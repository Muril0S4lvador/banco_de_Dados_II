import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import Header from './Header'
import { branchService, Branch } from '../services/branchService'
import './TableView.css'

export default function BranchList() {
    const { logout } = useAuthContext()
    const navigate = useNavigate()
    const [items, setItems] = useState<Branch[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadItems()
    }, [])

    const loadItems = async () => {
        try {
            setLoading(true)
            const data = await branchService.list()
            setItems(data)
        } catch (err) {
            console.error('Erro ao carregar agências:', err)
            alert('Erro ao carregar agências. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (item: Branch) => {
        if (!item.branch_name) return
        if (!confirm(`Deseja realmente excluir a agência ${item.branch_name}?`)) return
        try {
            await branchService.delete(item.branch_name)
            await loadItems()
            alert('Agência excluída com sucesso!')
        } catch (err: any) {
            console.error('Erro ao excluir agência:', err)
            alert(err.response?.data?.message || 'Erro ao excluir agência. Tente novamente.')
        }
    }

    const handleRowClick = (item: Branch) => {
        if (!item.branch_name) return
        navigate(`/table/branch/${encodeURIComponent(item.branch_name)}`)
    }

    const handleCreate = () => {
        navigate('/table/branch/new')
    }

    return (
        <div className="table-view-page">
            <Header onLogout={logout} />
            <div className="table-view-container">
                <div className="table-view-header">
                    <div>
                        <h1>Agências</h1>
                        <p>{items.length} agência(s) cadastrada(s)</p>
                    </div>
                    <div className="table-actions">
                        <button className="btn-create-item" onClick={handleCreate}>
                            Criar Agência
                        </button>
                    </div>
                </div>

                <div className="table-view-content">
                    {loading ? (
                        <div className="no-items"><p>Carregando agências...</p></div>
                    ) : items.length === 0 ? (
                        <div className="no-items">
                            <p>Nenhuma agência cadastrada</p>
                            <button className="btn-create-first" onClick={handleCreate}>
                                Criar Primeira Agência
                            </button>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Agência</th>
                                        <th>Cidade</th>
                                        <th>Ativos</th>
                                        <th className="actions-column">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.__id}>
                                            <td className="table-row-clickable" onClick={() => handleRowClick(item)}>{item.branch_name ?? '-'}</td>
                                            <td className="table-row-clickable" onClick={() => handleRowClick(item)}>{item.branch_city ?? '-'}</td>
                                            <td className="table-row-clickable" onClick={() => handleRowClick(item)}>
                                                {item.assets !== undefined ? item.assets : '-'}
                                            </td>
                                            <td className="actions-cell">
                                                <button
                                                    className="btn-delete-item"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDelete(item)
                                                    }}
                                                    title="Deletar agência"
                                                >
                                                    Excluir
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
