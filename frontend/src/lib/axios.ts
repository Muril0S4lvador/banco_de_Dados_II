import axios from 'axios'

// Detecta automaticamente a URL da API
// Se estiver em produção (porta 3000), usa a mesma origem mas porta 4444
// Se estiver em desenvolvimento, usa localhost:4444
const getBaseURL = () => {
    const hostname = window.location.hostname
    const protocol = window.location.protocol

    // Se estiver rodando na porta 3000 (produção/docker), usa o hostname atual
    if (window.location.port === '3000' || !window.location.port) {
        return `${protocol}//${hostname}:4444`
    }

    // Se estiver em desenvolvimento (Vite na porta 5173), usa localhost
    return 'http://localhost:4444'
}

// Configuração base do Axios
const api = axios.create({
    baseURL: getBaseURL(),
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
})

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api
