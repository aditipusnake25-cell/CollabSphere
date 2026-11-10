import React from "react";
import { useState } from "react";
import "../css/Login.css";

export default function Login({ onLogin, onShowRegister }) {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try { await onLogin(form);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
    };

    return (
        <main className="auth-page">
            <form className="auth-card" onSubmit={submit}>
                <div className="brand auth-brand"><span className="brand-mark">C</span> CollabSphere</div>
                <p className="eyebrow">WELCOME BACK</p>
                <h1>Sign in to your workspace</h1>
                <p className="muted">Collaborate, organize and build together.</p>
                {error && <div className="error-message">{error}</div>}
                <label>Email address<input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label>
                <label>Password<input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" /></label>
                <button className="button button-primary full-width" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
                <p className="auth-switch">Don't have an account? <button type="button" className="text-button" onClick={onShowRegister}>Create account</button></p>
            </form>
        </main>
    );
}
