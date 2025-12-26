import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import Header from './Header'
import { loanService, Loan } from '../services/loanService'
import './TableView.css'

export default function LoanList() {
    const { logout } = useAuthContext()
    const navigate = useNavigate()
    const [items, setItems] = useState<Loan[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadItems()
    }, [])

    const loadItems = async () => {
        try {
            setLoading(true)
            const data = await loanService.list()
            setItems(data)
        } catch (err) {
            console.error('Erro ao carregar empréstimos:', err)
            alert('Erro ao carregar empréstimos. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (item: Loan) => {
        if (!item.loan_number) return
        if (!confirm(`Deseja realmente excluir o empréstimo ${item.loan_number}?`)) return
        try {
            await loanService.delete(item.loan_number)
            await loadItems()
            alert('Empréstimo excluído com sucesso!')
        } catch (err: any) {
            console.error('Erro ao excluir empréstimo:', err)
            alert(err.response?.data?.message || 'Erro ao excluir empréstimo. Tente novamente.')
        }
    }

    const handleRowClick = (item: Loan) => {
        if (!item.loan_number) return
        navigate(`/table/loan/${encodeURIComponent(item.loan_number)}`)
    }

    const handleCreate = () => {
        navigate('/table/loan/new')
    }

    return (
        <div className="table-view-page">
            <Header onLogout={logout} />
            <div className="table-view-container">
                <div className="table-view-header">
                    <div>
                        <h1>Empréstimos</h1>
                        <p>{items.length} empréstimo(s) cadastrado(s)</p>
                    </div>
                    <div className="table-actions">
                        <button className="btn-create-item" onClick={handleCreate}>
                            Criar Empréstimo
                        </button>
                    </div>
                </div>

                <div className="table-view-content">
                    {loading ? (
                        <div className="no-items"><p>Carregando empréstimos...</p></div>
                    ) : items.length === 0 ? (
                        <div className="no-items">
                            <p>Nenhum empréstimo cadastrado</p>
                            <button className="btn-create-first" onClick={handleCreate}>
                                Criar Primeiro Empréstimo
                            </button>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Empréstimo</th>
                                        <th>Agência</th>
                                        <th>Valor</th>
                                        <th className="actions-column">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.__id}>
                                            <td className="table-row-clickable" onClick={() => handleRowClick(item)}>{item.loan_number ?? '-'}</td>
                                            <td className="table-row-clickable" onClick={() => handleRowClick(item)}>{item.branch_name ?? '-'}</td>
                                            <td className="table-row-clickable" onClick={() => handleRowClick(item)}>
                                                {item.amount !== undefined ? item.amount : '-'}
                                            </td>
                                            <td className="actions-cell">
                                                <button
                                                    className="btn-delete-item"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDelete(item)
                                                    }}
                                                    title="Deletar empréstimo"
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
