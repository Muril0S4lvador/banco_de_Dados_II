import { useState } from 'react'
import { useAuthContext } from '../contexts/AuthContext'
import Header from './Header'
import './Table.css'

interface Column {
    id: string
    name: string
    type: string
}

const COLUMN_TYPES = [
    { value: 'S', label: 'String' },
    { value: 'N', label: 'Number' },
    { value: 'B', label: 'Binary' },
    { value: 'BOOL', label: 'Boolean' },
    { value: 'NULL', label: 'Null' },
    { value: 'M', label: 'Map' },
    { value: 'L', label: 'List' },
    { value: 'SS', label: 'String Set' },
    { value: 'NS', label: 'Number Set' },
    { value: 'BS', label: 'Binary Set' },
]

function Table() {
    const { logout } = useAuthContext()

    const [tableNameInput, setTableNameInput] = useState('')
    const [columns, setColumns] = useState<Column[]>([
        { id: '1', name: '', type: 'S' }
    ])

    const handleAddColumn = () => {
        const newColumn: Column = {
            id: Date.now().toString(),
            name: '',
            type: 'S'
        }
        setColumns([...columns, newColumn])
    }

    const handleRemoveColumn = (id: string) => {
        if (columns.length > 1) {
            setColumns(columns.filter(col => col.id !== id))
        }
    }

    const handleColumnNameChange = (id: string, name: string) => {
        setColumns(columns.map(col =>
            col.id === id ? { ...col, name } : col
        ))
    }

    const handleColumnTypeChange = (id: string, type: string) => {
        setColumns(columns.map(col =>
            col.id === id ? { ...col, type } : col
        ))
    }

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()

        // Validações
        if (!tableNameInput.trim()) {
            alert('Por favor, preencha o nome da tabela')
            return
        }

        const emptyColumns = columns.filter(col => !col.name.trim())
        if (emptyColumns.length > 0) {
            alert('Por favor, preencha o nome de todas as colunas')
            return
        }

        // Preparar dados para envio (futuramente será enviado para a API)
        const tableData = {
            name: tableNameInput,
            columns: columns.map(col => ({
                name: col.name,
                type: col.type
            }))
        }

        console.log('Tabela salva:', tableData)
        alert(`Tabela "${tableNameInput}" salva com sucesso! (Frontend apenas)`)
    }

    return (
        <div className="table-page">
            <Header onLogout={logout} />
            <div className="table-container">
                <div className="table-header">
                    <h1>Criar Nova Tabela</h1>
                    <p>Defina o nome e os atributos da nova tabela</p>
                </div>

                <form onSubmit={handleSave} className="table-form">
                    <div className="form-section">
                        <div className="form-group">
                            <label htmlFor="tableName">Nome da Tabela *</label>
                            <input
                                type="text"
                                id="tableName"
                                value={tableNameInput}
                                onChange={(e) => setTableNameInput(e.target.value)}
                                placeholder="Ex: Customers, Products, Orders"
                                required
                            />
                        </div>
                    </div>

                    <div className="columns-section">
                        <div className="section-header">
                            <h2>Definição de Atributos</h2>
                            <button
                                type="button"
                                className="btn-add-column"
                                onClick={handleAddColumn}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Adicionar Coluna
                            </button>
                        </div>

                        <div className="columns-list">
                            <div className="columns-header">
                                <div className="column-header-name">Nome da Coluna</div>
                                <div className="column-header-type">Tipo</div>
                                <div className="column-header-actions">Ações</div>
                            </div>

                            {columns.map((column) => (
                                <div key={column.id} className="column-row">
                                    <div className="column-field">
                                        <input
                                            type="text"
                                            value={column.name}
                                            onChange={(e) => handleColumnNameChange(column.id, e.target.value)}
                                            placeholder="Nome do atributo"
                                            required
                                        />
                                    </div>
                                    <div className="column-field">
                                        <select
                                            value={column.type}
                                            onChange={(e) => handleColumnTypeChange(column.id, e.target.value)}
                                        >
                                            {COLUMN_TYPES.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="column-actions">
                                        <button
                                            type="button"
                                            className="btn-remove-column"
                                            onClick={() => handleRemoveColumn(column.id)}
                                            disabled={columns.length === 1}
                                            title="Remover coluna"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => window.history.back()}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-submit">
                            Criar Tabela
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Table
