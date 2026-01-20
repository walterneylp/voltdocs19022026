import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { LucideIcon } from "../components/LucideIcon";
import { getAuthUser } from "../lib/auth";
import {
  listUserGroupMembers,
  listUserGroups,
  listUsers,
  removeUserGroupMember
} from "../lib/api";
import { Grupos } from "./Grupos";
import "../styles/grupos.css";
import "../styles/grupos-novo.css";

export function GruposMembros() {
  const authUser = getAuthUser();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("id");
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([]);
  const [members, setMembers] = useState<Array<{ user_id: string; group_id: string }>>([]);
  const [users, setUsers] = useState<
    Array<{ id: string; name: string | null; email: string | null }>
  >([]);
  const [error, setError] = useState("");
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([listUserGroups(), listUserGroupMembers(), listUsers()])
      .then(([groupsList, membersList, usersList]) => {
        if (!isMounted) return;
        setGroups(groupsList);
        setMembers(
          membersList.map((member) => ({
            user_id: member.user_id,
            group_id: member.group_id
          }))
        );
        setUsers(
          usersList.map((user) => ({
            id: user.id,
            name: user.name ?? null,
            email: user.email ?? null
          }))
        );
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Falha ao carregar membros.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const group = useMemo(() => groups.find((item) => item.id === groupId), [groups, groupId]);
  const usersById = useMemo(
    () => new Map(users.map((user) => [user.id, user])),
    [users]
  );
  const memberUsers = useMemo(() => {
    if (!groupId) return [];
    return members
      .filter((member) => member.group_id === groupId)
      .map((member) => usersById.get(member.user_id))
      .filter(Boolean) as Array<{ id: string; name: string | null; email: string | null }>;
  }, [members, groupId, usersById]);

  const handleRemove = async (userId: string) => {
    if (!groupId) return;
    const ok = window.confirm("Remover este usuario do grupo?");
    if (!ok) return;
    setError("");
    setIsRemoving(userId);
    try {
      await removeUserGroupMember({ user_id: userId, group_id: groupId });
      setMembers((prev) =>
        prev.filter((member) => !(member.group_id === groupId && member.user_id === userId))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao remover usuario.");
    } finally {
      setIsRemoving(null);
    }
  };

  return (
    <div className="grupos-novo">
      <Grupos />

      <div className="grupos-modal-backdrop" aria-hidden="true" />

      <section className="grupos-modal" role="dialog" aria-label="Membros do grupo">
        <header className="grupos-modal-header">
          <h2>Membros: {group?.name ?? "Grupo"}</h2>
          <Link className="grupos-modal-close" to="/grupos" aria-label="Fechar">
            <LucideIcon name="x" className="grupos-modal-close-icon" />
          </Link>
        </header>

        <div className="grupos-modal-body">
          <p className="grupos-modal-text">
            Lista de usuários atribuídos a este grupo de manutenção.
          </p>
          {error ? <p className="grupos-error">{error}</p> : null}
          {groupId ? (
            <div className="grupos-members-box">
              {memberUsers.length === 0 ? (
                <p className="grupos-empty">Nenhum usuário neste grupo.</p>
              ) : (
                memberUsers.map((user) => (
                  <div className="grupos-member-row" key={user.id}>
                    <div>
                      <p className="grupos-member-name">{user.name ?? "—"}</p>
                      <p className="grupos-member-email">{user.email ?? "—"}</p>
                    </div>
                    <button
                      type="button"
                      className="grupos-member-remove"
                      onClick={() => handleRemove(user.id)}
                      disabled={isRemoving === user.id}
                    >
                      {isRemoving === user.id ? "Removendo..." : "Remover"}
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <p className="grupos-empty">Grupo nao informado.</p>
          )}
        </div>

        <footer className="grupos-modal-footer">
          <Link className="grupos-modal-save" to="/grupos">
            Fechar
          </Link>
        </footer>
      </section>
    </div>
  );
}
