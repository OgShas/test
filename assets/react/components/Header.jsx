import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { getUserFromToken, logout } from '../utils/auth';

export default function Header() {
    const [user, setUser] = useState(null); // store full user
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const currentUser = getUserFromToken();
        console.log('currentUser from useEffect:', currentUser);

        if (currentUser) {
            setUser(currentUser);          // store full user
            setIsLoggedIn(true);
            setIsAdmin(currentUser.is_admin);
        }
    }, []);

    const handleLogin = (loggedInUser) => {
        setUser(loggedInUser);          // save user on login
        setIsLoggedIn(true);
        setIsAdmin(loggedInUser.is_admin);
        window.location.href = loggedInUser.is_admin ? '/admin' : '/';
    };

    const handleRegister = (registeredUser) => {
        setUser(registeredUser);
        setIsLoggedIn(true);
        setIsAdmin(registeredUser.is_admin);
        window.location.href = registeredUser.is_admin ? '/admin' : '/';
    };

    const handleLogout = async () => {
        await logout();
        setUser(null);
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
                <>
                    {/* Display user name */}
                    <span>Welcome, {user?.name || 'User'}!</span>

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
                </>
            )}
        </header>
    );
}
