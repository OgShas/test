import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { getUserFromToken, logout } from '../utils/auth';

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const user = getUserFromToken();
        if (user) {
            setIsLoggedIn(true);
            setIsAdmin(user.is_admin);
        }
    }, []);

    // Header.jsx
    const handleLogin = (isAdmin) => {
        setIsLoggedIn(true);
        setIsAdmin(isAdmin);

        // 🔥 Redirect immediately based on admin
        window.location.href = isAdmin ? '/admin' : '/';
    };

    const handleRegister = (isAdmin) => {
        setIsLoggedIn(true);
        setIsAdmin(isAdmin);

        window.location.href = isAdmin ? '/admin' : '/';
    };

    const handleLogout = async () => {
        await logout();
        setIsLoggedIn(false);
        setIsAdmin(false);
        window.location.href = '/';
    };

    return (
        <header style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1em',
            padding: '1em',
            borderBottom: '1px solid #ccc'
        }}>
            <h2 style={{ margin: 0 }}>My Site</h2>

            {!isLoggedIn && (
                <>
                    <LoginForm onLogin={handleLogin} />
                    <RegisterForm onRegister={handleRegister} />
                </>
            )}

            {isLoggedIn && (
                <button
                    onClick={handleLogout}
                    style={{
                        padding: '0.5em 1em',
                        backgroundColor: '#333',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Logout
                </button>
            )}
        </header>
    );
}
