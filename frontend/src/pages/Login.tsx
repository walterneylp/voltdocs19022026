import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, setToken, setRefreshToken, getMe } from "../lib/api";
import { setAuthUser } from "../lib/auth";
import "../styles/login.css";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@voltdocs.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginTarget, setLoginTarget] = useState<"dashboard" | "mobile">("dashboard");

  const handleLogin = async (target: "dashboard" | "mobile") => {
    setError("");
    setIsLoading(true);
    setLoginTarget(target);
    try {
      const data = await login(email, password);
      if (!data.access_token) {
        throw new Error("Token nao retornado.");
      }
      setToken(data.access_token);
      if (data.refresh_token) {
        setRefreshToken(data.refresh_token);
      }
      const me = await getMe();
      setAuthUser({
        name: me.profile?.name ?? email,
        email: me.profile?.email ?? email
      });
      navigate(target === "mobile" ? "/mobile" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card" aria-label="Acesso ao sistema">
        <header className="login-brand">
          <div className="login-logo" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              className="login-logo-icon"
              role="img"
              aria-label="VoltDocs"
            >
              <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
            </svg>
          </div>
          <h1 className="login-title">VoltDocs</h1>
          <p className="login-subtitle">Gestão de Prontuários Elétricos (NR-10)</p>
        </header>

        <div className="login-form" role="form" aria-label="Acesso">
          <label className="login-label" htmlFor="email">
            E-mail
          </label>
          <input
            className="login-input"
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <p className="login-helper">
            Demo: admin@voltdocs.com ou tech@voltdocs.com
          </p>

          <label className="login-label" htmlFor="password">
            Senha
          </label>
          <input
            className="login-input"
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <div className="login-actions">
            <button
              className={`login-button${loginTarget === "dashboard" ? " is-active" : ""}`}
              type="button"
              disabled={isLoading}
              onClick={() => handleLogin("dashboard")}
            >
              {isLoading && loginTarget === "dashboard" ? "Entrando..." : "Dashboard"}
            </button>
            <button
              className={`login-button login-button-secondary${
                loginTarget === "mobile" ? " is-active" : ""
              }`}
              type="button"
              disabled={isLoading}
              onClick={() => handleLogin("mobile")}
            >
              {isLoading && loginTarget === "mobile" ? "Entrando..." : "Mobile"}
            </button>
          </div>
          {error ? <p className="login-error">{error}</p> : null}
        </div>
      </section>
    </main>
  );
}
