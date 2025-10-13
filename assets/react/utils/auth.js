import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'token';

export function saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}

export function getUserFromToken() {
    const token = getToken();
    if (!token) return null;
    try {
        const payload = jwtDecode(token);
        return {
            email: payload.email,
            is_admin: payload.is_admin ?? payload.isAdmin ?? false,
            roles: payload.roles ?? []
        };
    } catch (e) {
        return null;
    }
}

export function isAuthenticated() {
    return !!getToken();
}
