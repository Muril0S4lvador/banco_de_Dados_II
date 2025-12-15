import './Dashboard.css'

interface DashboardProps {
    user: any
    onLogout: () => void
}

function Dashboard({ user, onLogout }: DashboardProps) {
    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <button onClick={onLogout} className="logout-button">
                    Sair
                </button>
            </div>

            <div className="dashboard-content">
                <div className="user-card">
                    <h2>Informações do Usuário</h2>
                    <div className="user-info">
                        <div className="info-row">
                            <span className="info-label">User ID:</span>
                            <span className="info-value">{user.userId}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Username:</span>
                            <span className="info-value">{user.username}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Nome:</span>
                            <span className="info-value">{user.name}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Roles:</span>
                            <span className="info-value">{user.roleIds?.join(', ') || 'Nenhum'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Criado em:</span>
                            <span className="info-value">
                                {new Date(user.createdAt).toLocaleString('pt-BR')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
