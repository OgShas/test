import React from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function Header() {
    const handleLogin = (isAdmin) => {
        if (isAdmin) {
            window.location.href = '/admin';
        } else {
            window.location.href = '/homepage';
        }
    };

    const handleRegister = (isAdmin) => {
        if (isAdmin) {
            window.location.href = '/admin';
        } else {
            window.location.href = '/homepage';
        }
    };

    return (
        <header style={{ display: 'flex', gap: '1em', alignItems: 'center' }}>
            <h2>My Site</h2>
            <LoginForm onLogin={handleLogin} />
            <RegisterForm onRegister={handleRegister} />
        </header>
    );
}
