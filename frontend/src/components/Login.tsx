import { useState, FormEvent } from 'react'
import axios from 'axios'
import './Login.css'

interface LoginProps {
    onLoginSuccess: (userData: any) => void
}

function Login({ onLoginSuccess }: LoginProps) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Login request
            const loginResponse = await axios.post('/api/login', {
                username,
                password
            })

            if (loginResponse.data.success) {
                const token = loginResponse.data.data.token
                localStorage.setItem('token', token)

                // Get user info
                const userResponse = await axios.get('/api/me', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                if (userResponse.data.success) {
                    onLoginSuccess(userResponse.data.data)
                }
            }
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                'Erro ao fazer login. Verifique suas credenciais.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Login</h1>
                <p className="login-subtitle">Dynamo Local</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Digite seu username"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Digite sua senha"
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Carregando...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login
