/**
 * Configuração de rotas da aplicação
 */

// Rotas públicas (acessíveis sem autenticação)
export const PUBLIC_ROUTES = [
    '/',
    '/login',
]

// Rotas privadas (requerem autenticação)
export const PRIVATE_ROUTES = [
    '/home',
    '/profile',
    '/settings',
    '/users',
    '/roles',
    '/permissions',
]

/**
 * Verifica se a rota é pública
 */
export function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.includes(pathname)
}

/**
 * Verifica se a rota é privada
 */
export function isPrivateRoute(pathname: string): boolean {
    return PRIVATE_ROUTES.some(route => pathname.startsWith(route))
}