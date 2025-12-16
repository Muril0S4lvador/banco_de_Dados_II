// import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import Header from './Header'
import './TableView.css'

interface TableItem {
    [key: string]: any
}

// Mock de dados - futuramente será puxado da API
const MOCK_DATA: { [tableName: string]: TableItem[] } = {
    'Users': [
        { userId: 'user_001', username: 'john.doe', name: 'John Doe', email: 'john@example.com', createdAt: '2024-01-15' },
        { userId: 'user_002', username: 'jane.smith', name: 'Jane Smith', email: 'jane@example.com', createdAt: '2024-01-16' },
        { userId: 'user_003', username: 'bob.wilson', name: 'Bob Wilson', email: 'bob@example.com', createdAt: '2024-01-17' },
    ],
    'branch': [
        { branchId: 'br_001', branchName: 'Downtown', city: 'New York', assets: '1500000' },
        { branchId: 'br_002', branchName: 'Uptown', city: 'Boston', assets: '2300000' },
    ],
    'customer': [
        { customerId: 'cust_001', customerName: 'Alice Johnson', street: '123 Main St', city: 'New York' },
        { customerId: 'cust_002', customerName: 'Charlie Brown', street: '456 Oak Ave', city: 'Boston' },
        { customerId: 'cust_003', customerName: 'Diana Prince', street: '789 Elm St', city: 'Chicago' },
    ],
    'account': [
        { accountNumber: 'acc_001', branchId: 'br_001', balance: '15000' },
        { accountNumber: 'acc_002', branchId: 'br_002', balance: '32000' },
    ],
}

function TableView() {
    const { tableName } = useParams<{ tableName: string }>()
    const navigate = useNavigate()
    const { logout } = useAuthContext()

    const items = MOCK_DATA[tableName || ''] || []
    const columns = items.length > 0 ? Object.keys(items[0]) : []

    const handleRowClick = (item: TableItem) => {
        const primaryKey = columns[0] // Primeira coluna como chave primária
        const itemId = item[primaryKey]
        navigate(`/table/${tableName}/${itemId}`)
    }

    const handleDeleteItem = (item: TableItem, e: React.MouseEvent) => {
        e.stopPropagation()
        const primaryKey = columns[0]
        const itemId = item[primaryKey]

        if (confirm(`Deseja realmente excluir o item ${itemId}?`)) {
            console.log('Excluindo item:', itemId)
            alert('Item excluído com sucesso! (Frontend apenas)')
        }
    }

    const handleCreateItem = () => {
        navigate(`/table/${tableName}/new`)
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
                    <button className="btn-create-item" onClick={handleCreateItem}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Criar Item
                    </button>
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
