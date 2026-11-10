import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";
import "../css/auth.css";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
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
    setLoading(true);

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      const token = data.token || data.accessToken;

      if (!token) {
        throw new Error("Did not get token.");
      }

      localStorage.setItem("token", token);

      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-showcase">
        <Link className="auth-brand" to="/">
          <span className="auth-brand-mark">C</span>
          <span>Collab<span className="brand-light">Sphere</span></span>
        </Link>
        <div className="auth-showcase-copy">
          <span className="auth-kicker"><span /> YOUR TEAM’S SPACE TO CREATE</span>
          <h1>Make great work happen, <em>together.</em></h1>
          <p>One calm, connected place for your team’s projects, knowledge, and momentum.</p>
          <div className="auth-showcase-card">
            <div className="showcase-card-top">
              <span className="showcase-card-icon">✦</span>
              <span>Team workspace</span>
              <span className="showcase-online"><i /> Live</span>
            </div>
            <div className="showcase-lines"><i /><i /><i /></div>
            <div className="showcase-avatars"><span>J</span><span>M</span><span>A</span><b>+4</b></div>
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
            <span className="eyebrow">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>Pick up right where your team left off.</p>
          </div>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <label htmlFor="login-email">Email address</label>
          <div className="auth-input-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-label-row"><label htmlFor="login-password">Password</label></div>
          <div className="auth-input-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
            <button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? <><span className="button-spinner" /> Signing in...</> : <>Sign in <span aria-hidden="true">→</span></>}
          </button>

          <p className="auth-switch">New to CollabSphere? <Link to="/register">Create an account</Link></p>
          <p className="auth-terms">By continuing, you agree to work better together.</p>
        </form>
      </section>
    </div>
  );
}

export default Login;