import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import Header from './Header'
import './TableItemForm.css'
import { customerService } from '../services/customerService'

function CustomerForm() {
    const { itemId } = useParams<{ itemId?: string }>()
    const navigate = useNavigate()
    const { logout } = useAuthContext()
    const isEditMode = Boolean(itemId && itemId !== 'new')

    const [customerName, setCustomerName] = useState('')
    const [customerStreet, setCustomerStreet] = useState('')
    const [customerCity, setCustomerCity] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const loadItem = async () => {
            if (!isEditMode || !itemId) return
            try {
                setLoading(true)
                const item = await customerService.get(itemId)
                setCustomerName(item.customer_name || '')
                setCustomerStreet(item.customer_street || '')
                setCustomerCity(item.customer_city || '')
            } catch (err: any) {
                console.error('Erro ao carregar cliente:', err)
                alert(err?.response?.data?.message || 'Erro ao carregar cliente')
            } finally {
                setLoading(false)
            }
        }
        loadItem()
    }, [isEditMode, itemId])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!customerName.trim() || !customerStreet.trim() || !customerCity.trim()) {
            alert('Por favor, preencha todos os campos')
            return
        }

        const itemData = {
            customer_name: customerName.trim(),
            customer_street: customerStreet.trim(),
            customer_city: customerCity.trim()
        }

        try {
            setLoading(true)
            if (isEditMode && itemId) {
                await customerService.update(itemId, itemData)
            } else {
                await customerService.create(itemData)
            }
            alert(`Cliente ${isEditMode ? 'atualizado' : 'criado'} com sucesso!`)
            navigate('/table/customer')
        } catch (err: any) {
            console.error('Erro ao salvar cliente:', err)
            alert(err?.response?.data?.message || 'Erro ao salvar cliente')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="table-item-form-page">
            <Header onLogout={logout} />
            <div className="table-item-form-container">
                <div className="table-item-form-header">
                    <h1>{isEditMode ? 'Editar Cliente' : 'Criar Cliente'}</h1>
                    <p>{isEditMode ? 'Modifique os dados do cliente' : 'Preencha os dados do novo cliente'}</p>
                </div>

                <form onSubmit={handleSave} className="item-form">
                    <div className="attributes-section">
                        <h2>Dados do Cliente</h2>

                        <div className="form-field">
                            <label>Nome *</label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Digite o nome do cliente"
                                disabled={isEditMode}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label>Rua *</label>
                            <input
                                type="text"
                                value={customerStreet}
                                onChange={(e) => setCustomerStreet(e.target.value)}
                                placeholder="Digite a rua"
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label>Cidade *</label>
                            <input
                                type="text"
                                value={customerCity}
                                onChange={(e) => setCustomerCity(e.target.value)}
                                placeholder="Digite a cidade"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate('/table/customer')}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Salvando...' : isEditMode ? 'Atualizar Cliente' : 'Criar Cliente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CustomerForm
