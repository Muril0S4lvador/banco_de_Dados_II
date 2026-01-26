import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import Header from './Header'
import { borrowerService, Borrower } from '../services/borrowerService'
import './TableView.css'

export default function BorrowerList() {
    const { logout } = useAuthContext()
    const navigate = useNavigate()
    const [items, setItems] = useState<Borrower[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadItems()
    }, [])

    const loadItems = async () => {
        try {
            setLoading(true)
            const data = await borrowerService.list()
            setItems(data)
        } catch (err) {
            console.error('Erro ao carregar borrowers:', err)
            alert('Erro ao carregar borrowers. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (item: Borrower) => {
        if (!item.__id) return
        if (!confirm(`Deseja realmente excluir o mutuário ${item.customer_name}?`)) return
        try {
            await borrowerService.delete(item.__id)
            await loadItems()
            alert('Borrower excluído com sucesso!')
        } catch (err: any) {
            console.error('Erro ao excluir borrower:', err)
            alert(err.response?.data?.message || 'Erro ao excluir borrower. Tente novamente.')
        }
    }

    const handleRowClick = (item: Borrower) => {
        if (!item.__id) return
        navigate(`/table/borrower/${encodeURIComponent(item.__id)}`)
    }

    const handleCreate = () => {
        navigate('/table/borrower/new')
    }

    return (
        <div className="table-view-page">
            <Header onLogout={logout} />
            <div className="table-view-container">
                <div className="table-view-header">
                    <div>
                        <h1>Borrowers</h1>
                        <p>{items.length} borrower(s) cadastrado(s)</p>
                    </div>
                    <div className="table-actions">
                        <button className="btn-create-item" onClick={handleCreate}>
                            Criar Borrower
                        </button>
                    </div>
                </div>

                <div className="table-view-content">
                    {loading ? (
                        <div className="no-items"><p>Carregando borrowers...</p></div>
                    ) : items.length === 0 ? (
                        <div className="no-items">
                            <p>Nenhum borrower cadastrado</p>
                            <button className="btn-create-first" onClick={handleCreate}>
                                Criar Primeiro Borrower
                            </button>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Cliente</th>
                                        <th>Empréstimo</th>
                                        <th className="actions-column">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.__id}>
                                            <td className="table-row-clickable" onClick={() => handleRowClick(item)}>{item.customer_name ?? '-'}</td>
                                            <td className="table-row-clickable" onClick={() => handleRowClick(item)}>{item.loan_number ?? '-'}</td>
                                            <td className="actions-cell">
                                                <button
                                                    className="btn-delete-item"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDelete(item)
                                                    }}
                                                    title="Deletar borrower"
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
