import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from './Header'
import './EntityCrud.css'
import { createEntity, getEntity, updateEntity, EntityItem } from '../services/entityService'
import { useAuthContext } from '../contexts/AuthContext'

export interface EntityFormField {
    name: string
    label: string
    type?: 'text' | 'number'
}

export interface EntityFormConfig {
    title: string
    entityPath: string
    fields: EntityFormField[]
    baseRoute: string
    pkFields: string[]
}

interface Props {
    config: EntityFormConfig
}

function EntityForm({ config }: Props) {
    const { logout } = useAuthContext()
    const navigate = useNavigate()
    const { itemId } = useParams<{ itemId: string }>()
    const isEdit = Boolean(itemId && itemId !== 'new')

    const [formData, setFormData] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isEdit && itemId) {
            const load = async () => {
                try {
                    setLoading(true)
                    const data = await getEntity(config.entityPath, itemId)
                    setFormData(data || {})
                } catch (err: any) {
                    console.error(err)
                    setError(err?.response?.data?.message || 'Erro ao carregar item')
                } finally {
                    setLoading(false)
                }
            }
            load()
        } else {
            const initial: Record<string, any> = {}
            config.fields.forEach(f => { initial[f.name] = '' })
            setFormData(initial)
        }
    }, [isEdit, itemId, config.fields, config.entityPath])

    const handleChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const payload: EntityItem = { ...formData }

        for (const field of config.fields) {
            const raw = formData[field.name]
            if (field.type === 'number') {
                const num = Number(raw)
                if (Number.isNaN(num)) {
                    setError(`Campo ${field.label} deve ser numérico`)
                    return
                }
                payload[field.name] = num
            }
        }

        try {
            setLoading(true)
            if (isEdit && itemId) {
                await updateEntity(config.entityPath, itemId, payload)
            } else {
                await createEntity(config.entityPath, payload)
            }
            navigate(config.baseRoute)
        } catch (err: any) {
            console.error(err)
            setError(err?.response?.data?.message || 'Erro ao salvar')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="entity-page">
            <Header onLogout={logout} />
            <div className="entity-container">
                <div className="entity-header">
                    <div>
                        <h1>{isEdit ? `Editar ${config.title}` : `Novo ${config.title}`}</h1>
                    </div>
                    <div className="entity-actions">
                        <button className="btn btn-secondary" onClick={() => navigate(config.baseRoute)}>Voltar</button>
                    </div>
                </div>

                <div className="entity-card">
                    {loading && <p>Carregando...</p>}
                    {error && <p style={{ color: '#f87171' }}>{error}</p>}

                    {!loading && (
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                {config.fields.map((field) => (
                                    <div className="form-group" key={field.name}>
                                        <label>{field.label}</label>
                                        <input
                                            type={field.type === 'number' ? 'number' : 'text'}
                                            value={formData[field.name] ?? ''}
                                            onChange={(e) => handleChange(field.name, e.target.value)}
                                            required
                                            disabled={isEdit && config.pkFields.includes(field.name)}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => navigate(config.baseRoute)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EntityForm
