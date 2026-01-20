import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LucideIcon } from "../components/LucideIcon";
import { getAuthUser } from "../lib/auth";
import { Usuarios } from "./Usuarios";
import { createUser, getMe, listUserGroups } from "../lib/api";
import "../styles/usuarios.css";
import "../styles/usuarios-novo.css";

export function UsuariosNovo() {
  const authUser = getAuthUser();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("TECHNICIAN");
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [groupQuery, setGroupQuery] = useState("");
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getMe(), listUserGroups()])
      .then(([me, groupList]) => {
        if (!isMounted) return;
        setTenantId(me.profile.tenant_id);
        setGroups(groupList);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Falha ao carregar dados.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleGroup = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const filteredGroups = groups.filter((group) => {
    if (!groupQuery) return true;
    return group.name.toLowerCase().includes(groupQuery.toLowerCase());
  });

  const handleSave = async () => {
    if (!tenantId) {
      setError("Tenant nao encontrado no perfil.");
      return;
    }
    if (!name || !email || !password) {
      setError("Preencha nome, email e senha.");
      return;
    }
    if (password.length < 6) {
      setError("Senha precisa ter ao menos 6 caracteres.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      await createUser({
        name,
        email,
        password,
        role,
        tenant_id: tenantId,
        group_ids: selectedGroups.length ? selectedGroups : undefined
      });
      navigate("/usuarios");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar usuario.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="usuarios-novo">
      <Usuarios />

      <div className="usuarios-modal-backdrop" aria-hidden="true" />

      <section className="usuarios-modal" role="dialog" aria-label="Novo Usuário">
        <header className="usuarios-modal-header">
          <h2>Novo Usuário</h2>
          <Link className="usuarios-modal-close" to="/usuarios" aria-label="Fechar">
            <LucideIcon name="x" className="usuarios-modal-close-icon" />
          </Link>
        </header>

        <div className="usuarios-modal-body">
          <div className="usuarios-field">
            <label htmlFor="usuario-nome">Nome Completo</label>
            <input
              id="usuario-nome"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="usuarios-field">
            <label htmlFor="usuario-email">E-mail</label>
            <input
              id="usuario-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="usuarios-field">
            <label htmlFor="usuario-senha">Senha</label>
            <input
              id="usuario-senha"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <div className="usuarios-field">
            <label htmlFor="usuario-funcao">Função (Nível de Acesso)</label>
            <div className="usuarios-select">
              <select
                id="usuario-funcao"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="ADMIN_GLOBAL">Administrador Global</option>
                <option value="ADMIN_TENANT">Administrador</option>
                <option value="TECHNICIAN">Técnico</option>
              </select>
              <LucideIcon name="chevron-down" className="usuarios-select-icon" />
            </div>
          </div>
          <div className="usuarios-field">
            <label>Grupos de Manutenção</label>
            {groups.length === 0 ? (
              <p className="usuarios-helper">Nenhum grupo encontrado.</p>
            ) : (
              <>
                <div className="usuarios-multi">
                  <div className="usuarios-multi-input">
                    <LucideIcon name="search" className="usuarios-multi-icon" />
                    <input
                      type="text"
                      placeholder="Buscar grupos"
                      value={groupQuery}
                      onChange={(event) => {
                        setGroupQuery(event.target.value);
                        setShowGroupDropdown(true);
                      }}
                      onFocus={() => setShowGroupDropdown(true)}
                      onBlur={() => setTimeout(() => setShowGroupDropdown(false), 120)}
                    />
                  </div>
                  {showGroupDropdown ? (
                    <div className="usuarios-multi-dropdown">
                      {filteredGroups.length === 0 ? (
                        <div className="usuarios-multi-empty">Nenhum grupo encontrado.</div>
                      ) : (
                        filteredGroups.map((group) => (
                          <button
                            key={group.id}
                            type="button"
                            className="usuarios-multi-option"
                            onMouseDown={() => toggleGroup(group.id)}
                          >
                            <span>{group.name}</span>
                            <input
                              type="checkbox"
                              checked={selectedGroups.includes(group.id)}
                              readOnly
                            />
                          </button>
                        ))
                      )}
                    </div>
                  ) : null}
                </div>
                {selectedGroups.length > 0 ? (
                  <div className="usuarios-multi-tags">
                    {selectedGroups.map((groupId) => {
                      const group = groups.find((item) => item.id === groupId);
                      return (
                        <button
                          type="button"
                          className="usuarios-multi-tag"
                          key={groupId}
                          onClick={() => toggleGroup(groupId)}
                        >
                          {group?.name ?? "Grupo"} <span>×</span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </>
            )}
          </div>
          {error ? <p className="usuarios-error">{error}</p> : null}
        </div>

        <footer className="usuarios-modal-footer">
          <Link className="usuarios-modal-cancel" to="/usuarios">
            Cancelar
          </Link>
          <button
            className="usuarios-modal-save"
            type="button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Salvando..." : "Salvar"}
          </button>
        </footer>
      </section>
    </div>
  );
}
