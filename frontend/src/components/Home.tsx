import Header from './Header'
import './Home.css'

interface HomeProps {
    user: any
    onLogout: () => void
}

function Home({ user, onLogout }: HomeProps) {
    return (
        <>
            <Header onLogout={onLogout} />
            <div className="home-container">
                <div className="home-content">
                    <div className="user-card">
                        <h2>Informações do Usuário</h2>
                        <div className="user-info">
                            <div className="info-row">
                                <span className="info-label">User ID:</span>
                                <span className="info-value">{user?.userId}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Username:</span>
                                <span className="info-value">{user?.username}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Nome:</span>
                                <span className="info-value">{user?.name}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Roles:</span>
                                <span className="info-value">{user?.roleIds?.join(', ') || 'Nenhum'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Criado em:</span>
                                <span className="info-value">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleString('pt-BR') : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home
