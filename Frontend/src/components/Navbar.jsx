import React from "react";
import "../css/Navbar.css";

export default function Navbar({ user, onLogout }) {
    return (
        <header className="topbar">
            <div className="brand"><span className="brand-mark">C</span> CollabSphere</div>
            <div className="topbar-right">
                <span className="welcome-user">Hi, {user?.name || "Developer"}</span>
                <button className="button button-light button-small" onClick={onLogout}>Logout</button>
            </div>
        </header>
    );
}
