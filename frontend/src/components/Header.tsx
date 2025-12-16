import { Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import './Header.css'

interface HeaderProps {
    onLogout: () => void
}

function Header({ onLogout }: HeaderProps) {
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Fecha o menu ao clicar fora dele
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return (
        <header className="app-header">
            <div className="header-container">
                {/* Logo */}
                <Link to="/home" className="logo">
                    <span className="logo-main">Dynamo</span>
                    <span className="logo-sub">local</span>
                </Link>

                {/* Navigation */}
                <nav className="header-nav">
                    <Link to="/roles" className="nav-item">Roles</Link>
                    <Link to="/users" className="nav-item">Users</Link>

                    {/* Profile Menu */}
                    <div className="profile-menu-container" ref={menuRef}>
                        <button
                            className="profile-button"
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            <div className="profile-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                        </button>

                        {showProfileMenu && (
                            <div className="profile-dropdown">
                                <Link
                                    to="/profile"
                                    className="dropdown-item"
                                    onClick={() => setShowProfileMenu(false)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    Perfil
                                </Link>
                                <button
                                    className="dropdown-item logout-item"
                                    onClick={() => {
                                        setShowProfileMenu(false)
                                        onLogout()
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                        <line x1="21" y1="12" x2="9" y2="12"></line>
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    )
}

export default Header
