import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import Header from './Header'
import './TableItemForm.css'
import { loanService } from '../services/loanService'

function LoanForm() {
    const { itemId } = useParams<{ itemId?: string }>()
    const navigate = useNavigate()
    const { logout } = useAuthContext()
    const isEditMode = Boolean(itemId && itemId !== 'new')

    const [loanNumber, setLoanNumber] = useState('')
    const [branchName, setBranchName] = useState('')
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const loadItem = async () => {
            if (!isEditMode || !itemId) return
            try {
                setLoading(true)
                const item = await loanService.get(itemId)
                setLoanNumber(item.loan_number || '')
                setBranchName(item.branch_name || '')
                setAmount(item.amount !== undefined ? String(item.amount) : '')
            } catch (err: any) {
                console.error('Erro ao carregar empréstimo:', err)
                alert(err?.response?.data?.message || 'Erro ao carregar empréstimo')
            } finally {
                setLoading(false)
            }
        }
        loadItem()
    }, [isEditMode, itemId])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!loanNumber.trim() || !branchName.trim() || !amount.trim()) {
            alert('Por favor, preencha todos os campos')
            return
        }

        const amountNum = parseFloat(amount)
        if (isNaN(amountNum)) {
            alert('Valor deve ser um número válido')
            return
        }

        const itemData = {
            loan_number: loanNumber.trim(),
            branch_name: branchName.trim(),
            amount: amountNum
        }

        try {
            setLoading(true)
            if (isEditMode && itemId) {
                await loanService.update(itemId, itemData)
            } else {
                await loanService.create(itemData)
            }
            alert(`Empréstimo ${isEditMode ? 'atualizado' : 'criado'} com sucesso!`)
            navigate('/table/loan')
        } catch (err: any) {
            console.error('Erro ao salvar empréstimo:', err)
            alert(err?.response?.data?.message || 'Erro ao salvar empréstimo')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="table-item-form-page">
            <Header onLogout={logout} />
            <div className="table-item-form-container">
                <div className="table-item-form-header">
                    <h1>{isEditMode ? 'Editar Empréstimo' : 'Criar Empréstimo'}</h1>
                    <p>{isEditMode ? 'Modifique os dados do empréstimo' : 'Preencha os dados do novo empréstimo'}</p>
                </div>

                <form onSubmit={handleSave} className="item-form">
                    <div className="attributes-section">
                        <h2>Dados do Empréstimo</h2>

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

                        <div className="form-field">
                            <label>Agência *</label>
                            <input
                                type="text"
                                value={branchName}
                                onChange={(e) => setBranchName(e.target.value)}
                                placeholder="Digite o nome da agência"
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label>Valor *</label>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Digite o valor do empréstimo"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate('/table/loan')}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Salvando...' : isEditMode ? 'Atualizar Empréstimo' : 'Criar Empréstimo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default LoanForm
