import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";
import "../css/auth.css";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setMessage(data.message || "Registration successful!");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-showcase auth-showcase-register">
        <Link className="auth-brand" to="/">
          <span className="auth-brand-mark">C</span>
          <span>Collab<span className="brand-light">Sphere</span></span>
        </Link>
        <div className="auth-showcase-copy">
          <span className="auth-kicker"><span /> A BETTER WAY TO WORK TOGETHER</span>
          <h1>Your next great idea deserves a <em>great team.</em></h1>
          <p>Bring your projects, conversations, and shared knowledge into focus.</p>
          <div className="auth-quote-card">
            <span className="quote-mark">“</span>
            <p>Collaboration isn’t just working together. It’s making the work better.</p>
            <div className="quote-author"><span className="quote-avatar">C</span><span><strong>CollabSphere</strong><small>Made for teams that build</small></span></div>
          </div>
        </div>
        <div className="auth-showcase-footer">
          <span>Plan thoughtfully.</span><span>Build collaboratively.</span><span>Ship confidently.</span>
        </div>
        <div className="auth-decoration auth-decoration-one" />
        <div className="auth-decoration auth-decoration-two" />
      </section>

      <section className="auth-form-side">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-form-heading">
            <span className="auth-mobile-brand"><span className="auth-brand-mark">C</span> CollabSphere</span>
            <span className="eyebrow">GET STARTED FOR FREE</span>
            <h2>Create your account</h2>
            <p>Set up your space and invite your team when you’re ready.</p>
          </div>

          {error && <div className="auth-error" role="alert">{error}</div>}
          {message && <div className="auth-success" role="status">{message}</div>}

          <label htmlFor="register-name">Full name</label>
          <div className="auth-input-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></svg>
            <input
              id="register-name"
              type="text"
              name="name"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <label htmlFor="register-email">Email address</label>
          <div className="auth-input-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
            <input
              id="register-email"
              type="email"
              name="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <label htmlFor="register-password">Password</label>
          <div className="auth-input-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={6}
              required
            />
            <button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <p className="auth-field-hint">Use at least 6 characters for your password.</p>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? <><span className="button-spinner" /> Creating account...</> : <>Create account <span aria-hidden="true">→</span></>}
          </button>

          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
          <p className="auth-terms">By continuing, you agree to work better together.</p>
        </form>
      </section>
    </div>
  );
}

export default Register;