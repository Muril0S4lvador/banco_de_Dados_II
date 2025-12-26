import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import Header from './Header'
import './TableItemForm.css'
import { depositorService } from '../services/depositorService'

function DepositorForm() {
    const { itemId } = useParams<{ itemId?: string }>()
    const navigate = useNavigate()
    const { logout } = useAuthContext()
    const isEditMode = Boolean(itemId && itemId !== 'new')

    const [customerName, setCustomerName] = useState('')
    const [accountNumber, setAccountNumber] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const loadItem = async () => {
            if (!isEditMode || !itemId) return
            try {
                setLoading(true)
                const item = await depositorService.get(itemId)
                setCustomerName(item.customer_name || '')
                setAccountNumber(item.account_number || '')
            } catch (err: any) {
                console.error('Erro ao carregar depositante:', err)
                alert(err?.response?.data?.message || 'Erro ao carregar depositante')
            } finally {
                setLoading(false)
            }
        }
        loadItem()
    }, [isEditMode, itemId])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!customerName.trim() || !accountNumber.trim()) {
            alert('Por favor, preencha todos os campos')
            return
        }

        const itemData = {
            customer_name: customerName.trim(),
            account_number: accountNumber.trim()
        }

        try {
            setLoading(true)
            if (isEditMode && itemId) {
                await depositorService.update(itemId, itemData)
            } else {
                await depositorService.create(itemData)
            }
            alert(`Depositante ${isEditMode ? 'atualizado' : 'criado'} com sucesso!`)
            navigate('/table/depositor')
        } catch (err: any) {
            console.error('Erro ao salvar depositante:', err)
            alert(err?.response?.data?.message || 'Erro ao salvar depositante')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="table-item-form-page">
            <Header onLogout={logout} />
            <div className="table-item-form-container">
                <div className="table-item-form-header">
                    <h1>{isEditMode ? 'Editar Depositante' : 'Criar Depositante'}</h1>
                    <p>{isEditMode ? 'Modifique os dados do depositante' : 'Preencha os dados do novo depositante'}</p>
                </div>

                <form onSubmit={handleSave} className="item-form">
                    <div className="attributes-section">
                        <h2>Dados do Depositante</h2>

                        <div className="form-field">
                            <label>Nome do Cliente *</label>
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
                            <label>Número da Conta *</label>
                            <input
                                type="text"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                placeholder="Digite o número da conta"
                                disabled={isEditMode}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate('/table/depositor')}>
                            Cancelar
                        </button>
                        {!isEditMode && (
                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? 'Salvando...' : isEditMode ? 'Atualizar Depositante' : 'Criar Depositante'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default DepositorForm
