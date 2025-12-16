import { useAuthContext } from '../contexts/AuthContext'
import Header from './Header'
import './Settings.css'

function Settings() {
    const { logout } = useAuthContext()

    return (
        <>
            <Header onLogout={logout} />
            <div className="settings-container">
                <div className="settings-content">
                    <h1>Configurações</h1>
                    <p>Tela de configurações</p>
                </div>
            </div>
        </>
    )
}

export default Settings
