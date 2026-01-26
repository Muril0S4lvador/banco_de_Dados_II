import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import Header from './Header'
import { depositorService, Depositor } from '../services/depositorService'
import './TableView.css'

export default function DepositorList() {
    const { logout } = useAuthContext()
    const navigate = useNavigate()
    const [items, setItems] = useState<Depositor[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadItems()
    }, [])

    const loadItems = async () => {
        try {
            setLoading(true)
            const data = await depositorService.list()
            setItems(data)
        } catch (err) {
            console.error('Erro ao carregar depositantes:', err)
            alert('Erro ao carregar depositantes. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (item: Depositor) => {
        if (!item.__id) return
        if (!confirm(`Deseja realmente excluir o depositante ${item.customer_name}?`)) return
        try {
            await depositorService.delete(item.__id)
            await loadItems()
            alert('Depositante excluído com sucesso!')
        } catch (err: any) {
            console.error('Erro ao excluir depositante:', err)
            alert(err.response?.data?.message || 'Erro ao excluir depositante. Tente novamente.')
        }
    }

    const handleRowClick = (item: Depositor) => {
        if (!item.__id) return
        navigate(`/table/depositor/${encodeURIComponent(item.__id)}`)
    }

    const handleCreate = () => {
        navigate('/table/depositor/new')
    }

    return (
        <div className="table-view-page">
            <Header onLogout={logout} />
            <div className="table-view-container">
                <div className="table-view-header">
                    <div>
                        <h1>Depositantes</h1>
                        <p>{items.length} depositante(s) cadastrado(s)</p>
                    </div>
                    <div className="table-actions">
                        <button className="btn-create-item" onClick={handleCreate}>
                            Criar Depositante
                        </button>
                    </div>
                </div>

                <div className="table-view-content">
                    {loading ? (
                        <div className="no-items"><p>Carregando depositantes...</p></div>
                    ) : items.length === 0 ? (
                        <div className="no-items">
                            <p>Nenhum depositante cadastrado</p>
                            <button className="btn-create-first" onClick={handleCreate}>
                                Criar Primeiro Depositante
                            </button>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Cliente</th>
                                        <th>Conta</th>
                                        <th className="actions-column">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.__id}>
                                            <td className="table-row-clickable" onClick={() => handleRowClick(item)}>{item.customer_name ?? '-'}</td>
                                            <td className="table-row-clickable" onClick={() => handleRowClick(item)}>{item.account_number ?? '-'}</td>
                                            <td className="actions-cell">
                                                <button
                                                    className="btn-delete-item"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDelete(item)
                                                    }}
                                                    title="Deletar depositante"
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
