import { useState } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [user, setUser] = useState<any>(null)

    const handleLoginSuccess = (userData: any) => {
        setUser(userData)
        setIsAuthenticated(true)
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        setIsAuthenticated(false)
        setUser(null)
    }

    return (
        <div className="app">
            {!isAuthenticated ? (
                <Login onLoginSuccess={handleLoginSuccess} />
            ) : (
                <Dashboard user={user} onLogout={handleLogout} />
            )}
        </div>
    )
}

export default App
