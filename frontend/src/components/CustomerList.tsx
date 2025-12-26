import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import Header from './Header'
import { customerService, Customer } from '../services/customerService'
import './TableView.css'

export default function CustomerList() {
    const { logout } = useAuthContext()
    const navigate = useNavigate()
    const [items, setItems] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadItems()
    }, [])

    const loadItems = async () => {
        try {
            setLoading(true)
            const data = await customerService.list()
            setItems(data)
        } catch (err) {
            console.error('Erro ao carregar clientes:', err)
            alert('Erro ao carregar clientes. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (item: Customer) => {
        if (!item.customer_name) return
        if (!confirm(`Deseja realmente excluir o cliente ${item.customer_name}?`)) return
        try {
            await customerService.delete(item.customer_name)
            await loadItems()
            alert('Cliente excluído com sucesso!')
        } catch (err: any) {
            console.error('Erro ao excluir cliente:', err)
            alert(err.response?.data?.message || 'Erro ao excluir cliente. Tente novamente.')
        }
    }

    const handleRowClick = (item: Customer) => {
        if (!item.customer_name) return
        navigate(`/table/customer/${encodeURIComponent(item.customer_name)}`)
    }

    const handleCreate = () => {
        navigate('/table/customer/new')
    }

    return (
        <div className="table-view-page">
            <Header onLogout={logout} />
            <div className="table-view-container">
                <div className="table-view-header">
                    <div>
                        <h1>Clientes</h1>
                        <p>{items.length} cliente(s) cadastrado(s)</p>
                    </div>
                    <div className="table-actions">
                        <button className="btn-create-item" onClick={handleCreate}>
                            Criar Cliente
                        </button>
                    </div>
                </div>

                <div className="table-view-content">
                    {loading ? (
                        <div className="no-items"><p>Carregando clientes...</p></div>
                    ) : items.length === 0 ? (
                        <div className="no-items">
                            <p>Nenhum cliente cadastrado</p>
                            <button className="btn-create-first" onClick={handleCreate}>
                                Criar Primeiro Cliente
                            </button>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Rua</th>
                                        <th>Cidade</th>
                                        <th className="actions-column">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.__id}>
                                            <td className="table-row-clickable" onClick={() => handleRowClick(item)}>{item.customer_name ?? '-'}</td>
                                            <td className="table-row-clickable" onClick={() => handleRowClick(item)}>{item.customer_street ?? '-'}</td>
                                            <td className="table-row-clickable" onClick={() => handleRowClick(item)}>{item.customer_city ?? '-'}</td>
                                            <td className="actions-cell">
                                                <button
                                                    className="btn-delete-item"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDelete(item)
                                                    }}
                                                    title="Deletar cliente"
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
