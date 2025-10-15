import React, { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { jwtDecode } from "jwt-decode"; // ✅ correct import

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            try {
                const decoded = jwtDecode(token); // ✅ correct usage
                console.log("Decoded token:", decoded);

                setIsLoggedIn(true);
                setIsAdmin(!!decoded.is_admin);
            } catch (err) {
                console.error("Invalid token:", err);
                localStorage.removeItem("token");
                setIsLoggedIn(false);
            }
        }
    }, []);

    const handleLogin = (isAdmin) => {
        setIsLoggedIn(true);
        setIsAdmin(isAdmin);
        window.location.href = "/";
    };

    const handleRegister = (isAdmin) => {
        setIsLoggedIn(true);
        setIsAdmin(isAdmin);
        window.location.href = "/";
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setIsAdmin(false);
        window.location.href = "/";
    };

    return (
        <header
            style={{
                display: "flex",
                alignItems: "center",
                gap: "1em",
                padding: "1em",
                borderBottom: "1px solid #ccc",
            }}
        >
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
                        padding: "0.5em 1em",
                        backgroundColor: "#333",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    Logout
                </button>
            )}
        </header>
    );
}
