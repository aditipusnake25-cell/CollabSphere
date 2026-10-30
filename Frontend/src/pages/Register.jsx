import React from "react";
import { useState } from "react";
import "../css/Register.css";

export default function Register({ onRegister, onShowLogin }) {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try { await onRegister(form);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
    };

    return (
        <main className="auth-page">
            <form className="auth-card" onSubmit={submit}>
                <div className="brand auth-brand"><span className="brand-mark">C</span> CollabSphere</div>
                <p className="eyebrow">GET STARTED</p>
                <h1>Create your account</h1>
                <p className="muted">Bring your development work into one place.</p>
                {error && <div className="error-message">{error}</div>}
                <label>Full name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></label>
                <label>Email address<input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label>
                <label>Password<input type="password" minLength="6" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" /></label>
                <button className="button button-primary full-width" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
                <p className="auth-switch">Already registered? <button type="button" className="text-button" onClick={onShowLogin}>Login</button></p>
            </form>
        </main>
    );
}
