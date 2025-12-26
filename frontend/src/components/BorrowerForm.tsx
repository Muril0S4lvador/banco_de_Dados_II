import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import Header from './Header'
import './TableItemForm.css'
import { borrowerService } from '../services/borrowerService'

function BorrowerForm() {
    const { itemId } = useParams<{ itemId?: string }>()
    const navigate = useNavigate()
    const { logout } = useAuthContext()
    const isEditMode = Boolean(itemId && itemId !== 'new')

    const [customerName, setCustomerName] = useState('')
    const [loanNumber, setLoanNumber] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const loadItem = async () => {
            if (!isEditMode || !itemId) return
            try {
                const item = await borrowerService.get(itemId)
                setCustomerName(item.customer_name || '')
                setLoanNumber(item.loan_number || '')
            } catch (err: any) {
                console.error('Erro ao carregar borrower:', err)
                alert(err?.response?.data?.message || 'Erro ao carregar borrower')
            }
        }
        loadItem()
    }, [isEditMode, itemId])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!customerName.trim() || !loanNumber.trim()) {
            alert('Por favor, preencha todos os campos')
            return
        }

        const itemData = {
            customer_name: customerName.trim(),
            loan_number: loanNumber.trim()
        }

        try {
            setLoading(true)
            if (isEditMode && itemId) {
                await borrowerService.update(itemId, itemData)
            } else {
                await borrowerService.create(itemData)
            }
            alert(`Borrower ${isEditMode ? 'atualizado' : 'criado'} com sucesso!`)
            navigate('/table/borrower')
        } catch (err: any) {
            console.error('Erro ao salvar borrower:', err)
            alert(err?.response?.data?.message || 'Erro ao salvar borrower')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="table-item-form-page">
            <Header onLogout={logout} />
            <div className="table-item-form-container">
                <div className="table-item-form-header">
                    <h1>{isEditMode ? 'Editar Borrower' : 'Criar Borrower'}</h1>
                    <p>{isEditMode ? 'Modifique os dados do borrower' : 'Preencha os dados do novo borrower'}</p>
                </div>

                <form onSubmit={handleSave} className="item-form">
                    <div className="attributes-section">
                        <h2>Dados do Borrower</h2>

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
                            <label>Número do Empréstimo *</label>
                            <input
                                type="text"
                                value={loanNumber}
                                onChange={(e) => setLoanNumber(e.target.value)}
                                placeholder="Digite o número do empréstimo"
                                disabled={isEditMode}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate('/table/borrower')}>
                            Cancelar
                        </button>
                        {!isEditMode && 
                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? 'Salvando...' : isEditMode ? 'Atualizar Borrower' : 'Criar Borrower'}
                            </button>
                        }
                    </div>
                </form>
            </div>
        </div>
    )
}

export default BorrowerForm
