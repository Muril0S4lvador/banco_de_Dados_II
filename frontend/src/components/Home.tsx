import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from './Header'
import api from '../lib/axios'
import './Home.css'

interface HomeProps {
    onLogout: () => void
}

interface TableInfo {
    tableName: string
    itemCount: number
}

function Home({ onLogout }: HomeProps) {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [tables, setTables] = useState<TableInfo[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadTables()
    }, [])

    const loadTables = async () => {
        try {
            setLoading(true)
            const response = await api.get('/tables')
            setTables(response.data.data)
        } catch (error: any) {
            console.error('Erro ao carregar tabelas:', error)
            alert('Erro ao carregar tabelas: ' + (error.response?.data?.error || error.message))
        } finally {
            setLoading(false)
        }
    }

    const filteredTables = tables.filter(table =>
        table.tableName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleTableClick = (tableName: string) => {
        navigate(`/table/${tableName}`)
    }

    const handleCreateTable = () => {
        navigate('/table')
    }

    return (
        <div className="home-page">
            <Header onLogout={onLogout} />
            <div className="home-container">
                <div className="home-header">
                    <h1>Tabelas do Sistema</h1>
                    <p>Visualize e gerencie todas as tabelas do banco de dados</p>
                </div>

                <div className="tables-toolbar">
                    <div className="search-box">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <input
                            type="text"
                            placeholder="Pesquisar tabela..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn-create-table" onClick={handleCreateTable}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Nova Tabela
                    </button>
                </div>

                <div className="tables-list">
                    {loading ? (
                        <div className="no-results">
                            <p>Carregando tabelas...</p>
                        </div>
                    ) : filteredTables.length === 0 ? (
                        <div className="no-results">
                            <p>Nenhuma tabela encontrada</p>
                        </div>
                    ) : (
                        <div className="tables-grid">
                            {filteredTables.map((table) => (
                                <div
                                    key={table.tableName}
                                    className="table-card"
                                    onClick={() => handleTableClick(table.tableName)}
                                >
                                    <div className="table-icon">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="3" y1="9" x2="21" y2="9"></line>
                                            <line x1="9" y1="21" x2="9" y2="9"></line>
                                        </svg>
                                    </div>
                                    <div className="table-info">
                                        <h3 className="table-name">{table.tableName}</h3>
                                        <p className="table-count">{table.itemCount} {table.itemCount === 1 ? 'item' : 'itens'}</p>
                                    </div>
                                    <div className="table-arrow">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="9 18 15 12 9 6"></polyline>
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Home
