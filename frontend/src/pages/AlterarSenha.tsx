import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { updatePassword } from "../lib/api";
import "../styles/alterar-senha.css";

export function AlterarSenha() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password || !confirm) {
      setError("Preencha a nova senha e a confirmacao.");
      return;
    }
    if (password.length < 6) {
      setError("Senha precisa ter ao menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas nao conferem.");
      return;
    }

    setError("");
    setIsSaving(true);
    try {
      await updatePassword(password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao alterar senha.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="alterar-senha-page">
      <section className="alterar-senha-card" aria-label="Alterar senha">
        <header className="alterar-senha-header">
          <h1>Alterar senha</h1>
          <p>Defina uma nova senha para sua conta.</p>
        </header>

        <form className="alterar-senha-form" onSubmit={handleSubmit}>
          <label htmlFor="nova-senha">Nova senha</label>
          <input
            id="nova-senha"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <label htmlFor="confirmar-senha">Confirmar senha</label>
          <input
            id="confirmar-senha"
            type="password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />

          {error ? <p className="alterar-senha-error">{error}</p> : null}

          <div className="alterar-senha-actions">
            <Link className="alterar-senha-cancel" to="/dashboard">
              Cancelar
            </Link>
            <button type="submit" className="alterar-senha-submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
