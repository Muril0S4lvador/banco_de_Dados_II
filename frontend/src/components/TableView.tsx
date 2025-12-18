import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import Header from './Header'
import './TableView.css'
import { listItems, deleteItem } from '../services/tableItemService'
import axios from 'axios'

interface TableItem {
    [key: string]: any
}

interface TableSchema {
    name: string
    keySchema: Array<{ AttributeName: string; KeyType: string }>
    attributeDefinitions?: Array<{ AttributeName: string; AttributeType: string }>
}

function TableView() {
    const { tableName } = useParams<{ tableName: string }>()
    const navigate = useNavigate()
    const { logout } = useAuthContext()

    const [items, setItems] = useState<TableItem[]>([])
    const [columns, setColumns] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [tableSchema, setTableSchema] = useState<TableSchema | null>(null)

    // Carregar schema da tabela
    useEffect(() => {
        const loadTableSchema = async () => {
            try {
                const response = await axios.get(`${window.location.origin}/tables`)
                const tables: TableSchema[] = response.data
                const schema = tables.find((t: TableSchema) => t.name === tableName)
                setTableSchema(schema || null)
            } catch (err) {
                console.error('Erro ao carregar schema da tabela:', err)
            }
        }
        loadTableSchema()
    }, [tableName])

    // Carregar itens da tabela
    useEffect(() => {
        const loadItems = async () => {
            if (!tableName) return

            setLoading(true)
            setError(null)

            try {
                const response = await listItems(tableName)
                const loadedItems = response.items || []
                setItems(loadedItems)

                // Definir colunas baseado nos itens ou schema
                if (loadedItems.length > 0) {
                    // Coletar todas as chaves únicas de todos os itens
                    const allKeys = new Set<string>()
                    loadedItems.forEach(item => {
                        Object.keys(item).forEach(key => {
                            if (key !== '__id') allKeys.add(key)
                        })
                    })

                    // Ordenar colunas: primary key primeiro, depois alfabético
                    const primaryKey = tableSchema?.keySchema.find(k => k.KeyType === 'HASH')?.AttributeName
                    const sortKey = tableSchema?.keySchema.find(k => k.KeyType === 'RANGE')?.AttributeName

                    const orderedColumns: string[] = []
                    if (primaryKey && allKeys.has(primaryKey)) {
                        orderedColumns.push(primaryKey)
                        allKeys.delete(primaryKey)
                    }
                    if (sortKey && allKeys.has(sortKey)) {
                        orderedColumns.push(sortKey)
                        allKeys.delete(sortKey)
                    }

                    const remainingColumns = Array.from(allKeys).sort()
                    setColumns([...orderedColumns, ...remainingColumns])
                } else {
                    setColumns([])
                }
            } catch (err: any) {
                console.error('Erro ao carregar itens:', err)
                setError(err.response?.data?.message || 'Erro ao carregar itens da tabela')
            } finally {
                setLoading(false)
            }
        }

        loadItems()
    }, [tableName, tableSchema])

    const handleRowClick = (item: TableItem) => {
        const itemId = item.__id
        if (!itemId) return
        navigate(`/table/${tableName}/${itemId}`)
    }

    const handleDeleteItem = async (item: TableItem, e: React.MouseEvent) => {
        e.stopPropagation()
        const itemId = item.__id
        if (!itemId) return

        if (confirm(`Deseja realmente excluir o item ${itemId}?`)) {
            try {
                await deleteItem(tableName!, itemId)
                // Recarregar itens
                const response = await listItems(tableName!)
                setItems(response.items || [])
            } catch (err: any) {
                console.error('Erro ao excluir item:', err)
                alert(err.response?.data?.message || 'Erro ao excluir item')
            }
        }
    }

    const handleCreateItem = () => {
        navigate(`/table/${tableName}/new`)
    }

    const handleDeleteTable = async () => {
        if (confirm(`ATENÇÃO: Deseja realmente excluir a tabela "${tableName}" e todos os seus dados?\n\nEsta ação não pode ser desfeita!`)) {
            try {
                await axios.delete(`${window.location.origin}/tables/${tableName}`)
                alert(`Tabela "${tableName}" excluída com sucesso!`)
                navigate('/home')
            } catch (err: any) {
                console.error('Erro ao excluir tabela:', err)
                alert(err.response?.data?.message || 'Erro ao excluir tabela')
            }
        }
    }

    if (loading) {
        return (
            <div className="table-view-page">
                <Header onLogout={logout} />
                <div className="table-view-container">
                    <div className="loading">Carregando...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="table-view-page">
                <Header onLogout={logout} />
                <div className="table-view-container">
                    <div className="error-message">{error}</div>
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
                        <h1>{tableName}</h1>
                        <p>{items.length} {items.length === 1 ? 'item' : 'itens'} na tabela</p>
                    </div>
                    <div className="table-actions">
                        <button className="btn-delete-table" onClick={handleDeleteTable}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Apagar Tabela
                        </button>
                        <button className="btn-create-item" onClick={handleCreateItem}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Criar Item
                        </button>
                    </div>
                </div>

                <div className="table-view-content">
                    {items.length === 0 ? (
                        <div className="no-items">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="3" y1="9" x2="21" y2="9"></line>
                                <line x1="9" y1="21" x2="9" y2="9"></line>
                            </svg>
                            <p>Nenhum item encontrado nesta tabela</p>
                            <button className="btn-create-first" onClick={handleCreateItem}>
                                Criar Primeiro Item
                            </button>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th className="actions-column">Ações</th>
                                        {columns.map((column) => (
                                            <th key={column}>{column}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr
                                            key={index}
                                            onClick={() => handleRowClick(item)}
                                            className="table-row-clickable"
                                        >
                                            <td className="actions-cell">
                                                <button
                                                    className="btn-delete-item"
                                                    onClick={(e) => handleDeleteItem(item, e)}
                                                    title="Excluir item"
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                </button>
                                            </td>
                                            {columns.map((column) => (
                                                <td key={column}>
                                                    {typeof item[column] === 'object'
                                                        ? JSON.stringify(item[column])
                                                        : item[column]?.toString() || '-'}
                                                </td>
                                            ))}
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

export default TableView
