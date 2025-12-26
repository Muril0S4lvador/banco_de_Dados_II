import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import Header from './Header'
import './TableItemForm.css'
import { createItem, getItem, updateItem } from '../services/tableItemService'

interface ItemAttribute {
    id: string
    name: string
    type: string
    value: string
}

const ATTRIBUTE_TYPES = [
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

function TableItemForm() {
    const { tableName, itemId } = useParams<{ tableName: string; itemId?: string }>()
    const navigate = useNavigate()
    const { logout } = useAuthContext()
    const isEditMode = itemId && itemId !== 'new'

    const [attributes, setAttributes] = useState<ItemAttribute[]>([
        { id: '1', name: '', type: 'S', value: '' }
    ])
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        const loadItem = async () => {
            if (!isEditMode || !tableName || !itemId) return
            try {
                setLoading(true)
                const item = await getItem(tableName, itemId)
                const loadedAttributes: ItemAttribute[] = Object.entries(item)
                    .filter(([key]) => key !== '__id')
                    .map(([key, value], idx) => {
                        const valueType = (() => {
                            if (value === null) return 'NULL'
                            if (Array.isArray(value)) return 'L'
                            if (typeof value === 'object') return 'M'
                            if (typeof value === 'boolean') return 'BOOL'
                            if (typeof value === 'number') return 'N'
                            return 'S'
                        })()

                        const serializedValue = (() => {
                            if (value === null) return ''
                            if (typeof value === 'object') return JSON.stringify(value)
                            return String(value)
                        })()

                        return {
                            id: `${idx}-${key}`,
                            name: key,
                            type: valueType,
                            value: serializedValue,
                        }
                    })

                setAttributes(loadedAttributes.length > 0 ? loadedAttributes : [{ id: '1', name: '', type: 'S', value: '' }])
            } catch (err: any) {
                console.error('Erro ao carregar item:', err)
                alert(err?.response?.data?.message || 'Erro ao carregar item')
            } finally {
                setLoading(false)
            }
        }

        loadItem()
    }, [isEditMode, tableName, itemId])

    const handleAddAttribute = () => {
        const newAttribute: ItemAttribute = {
            id: Date.now().toString(),
            name: '',
            type: 'S',
            value: ''
        }
        setAttributes([...attributes, newAttribute])
    }

    const handleRemoveAttribute = (id: string) => {
        if (attributes.length > 1) {
            setAttributes(attributes.filter(attr => attr.id !== id))
        }
    }

    const handleAttributeNameChange = (id: string, name: string) => {
        setAttributes(attributes.map(attr =>
            attr.id === id ? { ...attr, name } : attr
        ))
    }

    const handleAttributeTypeChange = (id: string, type: string) => {
        setAttributes(attributes.map(attr =>
            attr.id === id ? { ...attr, type } : attr
        ))
    }

    const handleAttributeValueChange = (id: string, value: string) => {
        setAttributes(attributes.map(attr =>
            attr.id === id ? { ...attr, value } : attr
        ))
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validações
        const emptyNames = attributes.filter(attr => !attr.name.trim())
        if (emptyNames.length > 0) {
            alert('Por favor, preencha o nome de todos os atributos')
            return
        }

        const emptyValues = attributes.filter(attr => !attr.value.trim() && attr.type !== 'NULL')
        if (emptyValues.length > 0) {
            alert('Por favor, preencha o valor de todos os atributos')
            return
        }

        // Preparar dados para envio
        const itemData: { [key: string]: any } = {}
        attributes.forEach(attr => {
            if (attr.type === 'N') {
                itemData[attr.name] = parseFloat(attr.value)
            } else if (attr.type === 'BOOL') {
                itemData[attr.name] = attr.value.toLowerCase() === 'true'
            } else if (attr.type === 'NULL') {
                itemData[attr.name] = null
            } else if (attr.type === 'M' || attr.type === 'L') {
                try {
                    itemData[attr.name] = JSON.parse(attr.value)
                } catch {
                    alert(`Valor inválido para ${attr.name}. Use JSON válido para Map ou List`)
                    return
                }
            } else if (attr.type === 'SS' || attr.type === 'NS' || attr.type === 'BS') {
                itemData[attr.name] = attr.value.split(',').map(v => v.trim())
            } else {
                itemData[attr.name] = attr.value
            }
        })

        try {
            setLoading(true)
            if (isEditMode) {
                await updateItem(tableName!, itemId!, itemData)
            } else {
                await createItem(tableName!, itemData)
            }
            alert(`Item ${isEditMode ? 'atualizado' : 'criado'} com sucesso!`)
            navigate(`/table/${tableName}`)
        } catch (err: any) {
            console.error('Erro ao salvar item:', err)
            alert(err?.response?.data?.message || 'Erro ao salvar item')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="table-item-form-page">
            <Header onLogout={logout} />
            <div className="table-item-form-container">
                <div className="table-item-form-header">
                    <h1>{isEditMode ? `Editar Item - ${tableName}` : `Criar Item - ${tableName}`}</h1>
                    <p>{isEditMode ? 'Modifique os atributos do item existente' : 'Defina os atributos para o novo item'}</p>
                </div>

                <form onSubmit={handleSave} className="item-form">
                    <div className="attributes-section">
                        <div className="section-header">
                            <h2>Atributos do Item</h2>
                            <button
                                type="button"
                                className="btn-add-attribute"
                                onClick={handleAddAttribute}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Adicionar Atributo
                            </button>
                        </div>

                        <div className="attributes-list">
                            <div className="attributes-header">
                                <div className="attribute-header-name">Nome do Atributo</div>
                                <div className="attribute-header-type">Tipo</div>
                                <div className="attribute-header-value">Valor</div>
                                <div className="attribute-header-actions">Ações</div>
                            </div>

                            {attributes.map((attribute) => (
                                <div key={attribute.id} className="attribute-row">
                                    <div className="attribute-field">
                                        <input
                                            type="text"
                                            value={attribute.name}
                                            onChange={(e) => handleAttributeNameChange(attribute.id, e.target.value)}
                                            placeholder="Nome do atributo"
                                            required
                                        />
                                    </div>
                                    <div className="attribute-field">
                                        <select
                                            value={attribute.type}
                                            onChange={(e) => handleAttributeTypeChange(attribute.id, e.target.value)}
                                        >
                                            {ATTRIBUTE_TYPES.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="attribute-field">
                                        <input
                                            type="text"
                                            value={attribute.value}
                                            onChange={(e) => handleAttributeValueChange(attribute.id, e.target.value)}
                                            placeholder={
                                                attribute.type === 'M' || attribute.type === 'L' ? 'JSON válido' :
                                                    attribute.type === 'SS' || attribute.type === 'NS' || attribute.type === 'BS' ? 'Valores separados por vírgula' :
                                                        attribute.type === 'BOOL' ? 'true ou false' :
                                                            attribute.type === 'NULL' ? 'null' :
                                                                'Valor do atributo'
                                            }
                                            disabled={attribute.type === 'NULL'}
                                            required={attribute.type !== 'NULL'}
                                        />
                                    </div>
                                    <div className="attribute-actions">
                                        <button
                                            type="button"
                                            className="btn-remove-attribute"
                                            onClick={() => handleRemoveAttribute(attribute.id)}
                                            disabled={attributes.length === 1}
                                            title="Remover atributo"
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
                        <button type="button" className="btn-cancel" onClick={() => navigate(`/table/${tableName}`)}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Salvando...' : isEditMode ? 'Atualizar Item' : 'Criar Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default TableItemForm
