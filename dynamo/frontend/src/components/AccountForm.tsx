import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import Header from './Header'
import './TableItemForm.css'
import { accountService } from '../services/accountService'

function AccountForm() {
    const { itemId } = useParams<{ itemId?: string }>()
    const navigate = useNavigate()
    const { logout } = useAuthContext()
    const isEditMode = Boolean(itemId && itemId !== 'new')

    const [accountNumber, setAccountNumber] = useState('')
    const [branchName, setBranchName] = useState('')
    const [balance, setBalance] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const loadItem = async () => {
            if (!isEditMode || !itemId) return
            try {
                setLoading(true)
                const item = await accountService.get(itemId)
                setAccountNumber(item.account_number || '')
                setBranchName(item.branch_name || '')
                setBalance(item.balance !== undefined ? String(item.balance) : '')
            } catch (err: any) {
                console.error('Erro ao carregar conta:', err)
                alert(err?.response?.data?.message || 'Erro ao carregar conta')
            } finally {
                setLoading(false)
            }
        }
        loadItem()
    }, [isEditMode, itemId])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!accountNumber.trim() || !branchName.trim() || !balance.trim()) {
            alert('Por favor, preencha todos os campos')
            return
        }

        const balanceNum = parseFloat(balance)
        if (isNaN(balanceNum)) {
            alert('Saldo deve ser um número válido')
            return
        }

        const itemData = {
            account_number: accountNumber.trim(),
            branch_name: branchName.trim(),
            balance: balanceNum
        }

        try {
            setLoading(true)
            if (isEditMode && itemId) {
                await accountService.update(itemId, itemData)
            } else {
                await accountService.create(itemData)
            }
            alert(`Conta ${isEditMode ? 'atualizada' : 'criada'} com sucesso!`)
            navigate('/table/account')
        } catch (err: any) {
            console.error('Erro ao salvar conta:', err)
            alert(err?.response?.data?.message || 'Erro ao salvar conta')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="table-item-form-page">
            <Header onLogout={logout} />
            <div className="table-item-form-container">
                <div className="table-item-form-header">
                    <h1>{isEditMode ? 'Editar Conta' : 'Criar Conta'}</h1>
                    <p>{isEditMode ? 'Modifique os dados da conta' : 'Preencha os dados da nova conta'}</p>
                </div>

                <form onSubmit={handleSave} className="item-form">
                    <div className="attributes-section">
                        <h2>Dados da Conta</h2>

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
                            <label>Saldo *</label>
                            <input
                                type="number"
                                step="0.01"
                                value={balance}
                                onChange={(e) => setBalance(e.target.value)}
                                placeholder="Digite o saldo"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate('/table/account')}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Salvando...' : isEditMode ? 'Atualizar Conta' : 'Criar Conta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AccountForm
