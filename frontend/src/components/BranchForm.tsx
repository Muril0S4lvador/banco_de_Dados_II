import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import Header from './Header'
import './TableItemForm.css'
import { branchService } from '../services/branchService'

function BranchForm() {
    const { itemId } = useParams<{ itemId?: string }>()
    const navigate = useNavigate()
    const { logout } = useAuthContext()
    const isEditMode = Boolean(itemId && itemId !== 'new')

    const [branchName, setBranchName] = useState('')
    const [branchCity, setBranchCity] = useState('')
    const [assets, setAssets] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const loadItem = async () => {
            if (!isEditMode || !itemId) return
            try {
                setLoading(true)
                const item = await branchService.get(itemId)
                setBranchName(item.branch_name || '')
                setBranchCity(item.branch_city || '')
                setAssets(item.assets !== undefined ? String(item.assets) : '')
            } catch (err: any) {
                console.error('Erro ao carregar agência:', err)
                alert(err?.response?.data?.message || 'Erro ao carregar agência')
            } finally {
                setLoading(false)
            }
        }
        loadItem()
    }, [isEditMode, itemId])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!branchName.trim() || !branchCity.trim() || !assets.trim()) {
            alert('Por favor, preencha todos os campos')
            return
        }

        const assetsNum = parseFloat(assets)
        if (isNaN(assetsNum)) {
            alert('Ativos deve ser um número válido')
            return
        }

        const itemData = {
            branch_name: branchName.trim(),
            branch_city: branchCity.trim(),
            assets: assetsNum
        }

        try {
            setLoading(true)
            if (isEditMode && itemId) {
                await branchService.update(itemId, itemData)
            } else {
                await branchService.create(itemData)
            }
            alert(`Agência ${isEditMode ? 'atualizada' : 'criada'} com sucesso!`)
            navigate('/table/branch')
        } catch (err: any) {
            console.error('Erro ao salvar agência:', err)
            alert(err?.response?.data?.message || 'Erro ao salvar agência')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="table-item-form-page">
            <Header onLogout={logout} />
            <div className="table-item-form-container">
                <div className="table-item-form-header">
                    <h1>{isEditMode ? 'Editar Agência' : 'Criar Agência'}</h1>
                    <p>{isEditMode ? 'Modifique os dados da agência' : 'Preencha os dados da nova agência'}</p>
                </div>

                <form onSubmit={handleSave} className="item-form">
                    <div className="attributes-section">
                        <h2>Dados da Agência</h2>

                        <div className="form-field">
                            <label>Nome da Agência *</label>
                            <input
                                type="text"
                                value={branchName}
                                onChange={(e) => setBranchName(e.target.value)}
                                placeholder="Digite o nome da agência"
                                disabled={isEditMode}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label>Cidade *</label>
                            <input
                                type="text"
                                value={branchCity}
                                onChange={(e) => setBranchCity(e.target.value)}
                                placeholder="Digite a cidade"
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label>Ativos *</label>
                            <input
                                type="number"
                                step="0.01"
                                value={assets}
                                onChange={(e) => setAssets(e.target.value)}
                                placeholder="Digite o valor dos ativos"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate('/table/branch')}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Salvando...' : isEditMode ? 'Atualizar Agência' : 'Criar Agência'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default BranchForm
