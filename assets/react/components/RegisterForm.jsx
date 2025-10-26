import React, { useState } from 'react';
import { saveToken } from '../utils/auth';

export default function RegisterForm({ onRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        setErr(null);

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                setErr(data.error || 'Register failed');
                return;
            }

            // Save the JWT token locally
            saveToken(data.token);

            // 🔥 Synchronize Symfony session with JWT
            await fetch('/auth/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: data.token }),
                credentials: 'include', // 👈 THIS IS CRITICAL
            });

            // Notify parent component (Header)
            if (onRegister) onRegister(data.is_admin);
        } catch (error) {
            setErr('Network error');
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'inline-block', marginLeft: '1em' }}>
            {err && <div style={{ color: 'red' }}>{err}</div>}
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
            />
            <button type="submit">Register</button>
        </form>
    );
}
