import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from './Header'
import './EntityCrud.css'
import { deleteEntity, listEntity, EntityItem } from '../services/entityService'
import { useAuthContext } from '../contexts/AuthContext'

export interface EntityField {
    name: string
    label: string
}

export interface EntityListConfig {
    title: string
    entityPath: string
    fields: EntityField[]
    baseRoute: string
}

interface Props {
    config: EntityListConfig
}

function EntityList({ config }: Props) {
    const { logout } = useAuthContext()
    const navigate = useNavigate()
    const [items, setItems] = useState<EntityItem[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const load = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await listEntity(config.entityPath)
            setItems(data)
        } catch (err: any) {
            console.error(err)
            setError(err?.response?.data?.message || 'Erro ao carregar itens')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const handleDelete = async (item: EntityItem) => {
        const itemId = item.__id
        if (!itemId) return
        if (!confirm('Deseja realmente excluir este item?')) return
        try {
            await deleteEntity(config.entityPath, itemId)
            await load()
        } catch (err: any) {
            console.error(err)
            alert(err?.response?.data?.message || 'Erro ao excluir item')
        }
    }

    return (
        <div className="entity-page">
            <Header onLogout={logout} />
            <div className="entity-container">
                <div className="entity-header">
                    <div>
                        <h1>{config.title}</h1>
                        <p>{items.length} registros</p>
                    </div>
                    <div className="entity-actions">
                        <button className="btn btn-primary" onClick={() => navigate(`${config.baseRoute}/new`)}>Novo</button>
                    </div>
                </div>

                <div className="entity-card">
                    {loading && <p>Carregando...</p>}
                    {error && <p style={{ color: '#f87171' }}>{error}</p>}
                    {!loading && !error && (
                        <table className="entity-table">
                            <thead>
                                <tr>
                                    {config.fields.map((f) => (
                                        <th key={f.name}>{f.label}</th>
                                    ))}
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan={config.fields.length + 1}>Nenhum registro</td>
                                    </tr>
                                )}
                                {items.map((item, idx) => (
                                    <tr key={idx}>
                                        {config.fields.map((f) => (
                                            <td key={f.name}>{item[f.name] ?? '-'}</td>
                                        ))}
                                        <td>
                                            <button className="btn btn-secondary" onClick={() => navigate(`${config.baseRoute}/${encodeURIComponent(item.__id)}`)}>Editar</button>
                                            <button className="btn btn-danger" style={{ marginLeft: 8 }} onClick={() => handleDelete(item)}>Excluir</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EntityList
