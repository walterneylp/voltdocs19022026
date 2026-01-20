import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Chamados } from "./Chamados";
import { LucideIcon } from "../components/LucideIcon";
import { getMe, createTicket, listAssets, listProfiles, listUserGroups, assignTicketGroup } from "../lib/api";
import "../styles/chamados.css";
import "../styles/chamados-novo.css";

export function ChamadosNovo() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [assets, setAssets] = useState<Array<{ id: string; tag: string; name: string }>>(
    []
  );
  const [profiles, setProfiles] = useState<
    Array<{ id: string; name: string; role: string | null }>
  >([]);
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([]);
  const [equipmentQuery, setEquipmentQuery] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<{
    id: string;
    tag: string;
    name: string;
  } | null>(null);
  const [showEquipmentDropdown, setShowEquipmentDropdown] = useState(false);
  const [priority, setPriority] = useState("MÉDIA");
  const [technicianQuery, setTechnicianQuery] = useState("");
  const [selectedTechnicians, setSelectedTechnicians] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [showTechnicianDropdown, setShowTechnicianDropdown] = useState(false);
  const [onlyTechnicians, setOnlyTechnicians] = useState(true);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [groupQuery, setGroupQuery] = useState("");
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getMe(), listAssets(), listProfiles(), listUserGroups()])
      .then(([me, assetList, profileList, groupList]) => {
        if (!isMounted) return;
        setTenantId(me.profile.tenant_id ?? null);
        setUserId(me.profile.id ?? null);
        setAssets(assetList);
        setProfiles(
          profileList.map((profile) => ({
            id: profile.id,
            name: profile.name ?? profile.email ?? "Sem nome",
            role: profile.role ?? null
          }))
        );
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

  const filteredEquipmentOptions = useMemo(() => {
    if (!equipmentQuery) return assets;
    const query = equipmentQuery.toLowerCase();
    return assets.filter(
      (asset) =>
        asset.tag.toLowerCase().includes(query) ||
        asset.name.toLowerCase().includes(query)
    );
  }, [assets, equipmentQuery]);

  const filteredTechnicians = useMemo(() => {
    const base = onlyTechnicians
      ? profiles.filter((profile) => profile.role === "TECHNICIAN")
      : profiles;
    if (!technicianQuery) return base;
    const query = technicianQuery.toLowerCase();
    return base.filter((profile) => profile.name.toLowerCase().includes(query));
  }, [profiles, technicianQuery, onlyTechnicians]);

  const availableTechnicians = filteredTechnicians.filter(
    (profile) => !selectedTechnicians.some((item) => item.id === profile.id)
  );

  const filteredGroups = useMemo(() => {
    if (!groupQuery) return groups;
    const query = groupQuery.toLowerCase();
    return groups.filter((group) => group.name.toLowerCase().includes(query));
  }, [groups, groupQuery]);

  const availableGroups = filteredGroups.filter(
    (group) => !selectedGroups.includes(group.id)
  );

  const handleSelectEquipment = (asset: { id: string; tag: string; name: string }) => {
    setSelectedEquipment(asset);
    setEquipmentQuery(asset.tag);
    setShowEquipmentDropdown(false);
  };

  const handleSelectTechnician = (profile: { id: string; name: string }) => {
    if (selectedTechnicians.some((item) => item.id === profile.id)) return;
    setSelectedTechnicians((prev) => [...prev, profile]);
    setTechnicianQuery("");
    setShowTechnicianDropdown(false);
  };

  const handleRemoveTechnician = (id: string) => {
    setSelectedTechnicians((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSelectGroup = (groupId: string) => {
    if (selectedGroups.includes(groupId)) return;
    setSelectedGroups((prev) => [...prev, groupId]);
    setGroupQuery("");
    setShowGroupDropdown(false);
  };

  const handleRemoveGroup = (groupId: string) => {
    setSelectedGroups((prev) => prev.filter((id) => id !== groupId));
  };

  const handleSave = async () => {
    if (!title) {
      setError("Preencha o título.");
      return;
    }
    if (!selectedEquipment) {
      setError("Selecione o equipamento.");
      return;
    }
    if (!tenantId) {
      setError("Tenant não encontrado.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      const [primaryTechnician, ...extraTechnicians] = selectedTechnicians;
      const mixedAssignments = [
        ...selectedGroups,
        ...extraTechnicians.map((tech) => tech.id)
      ];
      const ticket = await createTicket({
        title,
        description: description || null,
        priority: priority || null,
        equipment_id: selectedEquipment.id,
        opened_by_id: userId,
        assigned_to_id: primaryTechnician?.id ?? null,
        tenant_id: tenantId,
        assigned_group_ids: mixedAssignments.length > 0 ? mixedAssignments : null
      });

      if (selectedGroups.length > 0) {
        await Promise.all(
          selectedGroups.map((groupId) =>
            assignTicketGroup({ ticket_id: ticket.id, group_id: groupId, tenant_id: tenantId })
          )
        );
      }
      navigate("/chamados");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar chamado.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="chamados-novo">
      <Chamados />

      <div className="chamados-modal-backdrop" aria-hidden="true" />

      <section className="chamados-modal" role="dialog" aria-label="Novo Chamado">
        <header className="chamados-modal-header">
          <h2>Novo Chamado</h2>
          <Link className="chamados-modal-close" to="/chamados" aria-label="Fechar">
            <LucideIcon name="x" className="chamados-modal-close-icon" />
          </Link>
        </header>

        <div className="chamados-modal-body">
          <div className="chamados-field">
            <label htmlFor="chamado-titulo">Título</label>
            <input
              id="chamado-titulo"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="chamados-field">
            <label htmlFor="chamado-descricao">Descrição do Problema</label>
            <input
              id="chamado-descricao"
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="chamados-grid">
            <div className="chamados-field">
              <label htmlFor="chamado-equipamento">Equipamento Afetado</label>
              <div className="chamados-select">
                <input
                  id="chamado-equipamento"
                  type="text"
                  placeholder="Buscar equipamento..."
                  value={equipmentQuery}
                  onChange={(event) => {
                    setEquipmentQuery(event.target.value);
                    if (selectedEquipment && event.target.value !== selectedEquipment.tag) {
                      setSelectedEquipment(null);
                    }
                  }}
                  onFocus={() => setShowEquipmentDropdown(true)}
                  onBlur={() => setTimeout(() => setShowEquipmentDropdown(false), 120)}
                />
                <LucideIcon name="search" className="chamados-select-icon" />
                {showEquipmentDropdown && !selectedEquipment && filteredEquipmentOptions.length > 0 ? (
                  <div className="chamados-select-dropdown">
                    {filteredEquipmentOptions.slice(0, 5).map((asset) => (
                      <button
                        key={asset.id}
                        type="button"
                        className="chamados-select-option"
                        onMouseDown={() => handleSelectEquipment(asset)}
                      >
                        {asset.tag} - {asset.name}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="chamados-field">
              <label htmlFor="chamado-prioridade">Prioridade</label>
              <div className="chamados-select">
                <select
                  id="chamado-prioridade"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                >
                  <option value="BAIXA">BAIXA</option>
                  <option value="MÉDIA">MÉDIA</option>
                  <option value="ALTA">ALTA</option>
                  <option value="CRÍTICA">CRÍTICA</option>
                </select>
                <LucideIcon name="chevron-down" className="chamados-select-icon" />
              </div>
            </div>
          </div>

          <div className="chamados-atribuir">
            <p className="chamados-atribuir-title">ATRIBUIÇÃO (QUEM RESOLVE?)</p>
            <div className="chamados-field">
              <label htmlFor="chamado-tecnico">Técnico Responsável (Opcional)</label>
              <div className="chamados-select">
                <input
                  id="chamado-tecnico"
                  type="text"
                  placeholder="Buscar técnico..."
                  value={technicianQuery}
                  onChange={(event) => {
                    setTechnicianQuery(event.target.value);
                  }}
                  onFocus={() => setShowTechnicianDropdown(true)}
                  onBlur={() => setTimeout(() => setShowTechnicianDropdown(false), 120)}
                />
                <LucideIcon name="search" className="chamados-select-icon" />
                {showTechnicianDropdown && availableTechnicians.length > 0 ? (
                  <div className="chamados-select-dropdown">
                    {availableTechnicians.slice(0, 5).map((profile) => (
                      <button
                        key={profile.id}
                        type="button"
                        className="chamados-select-option"
                        onMouseDown={() => handleSelectTechnician(profile)}
                      >
                        {profile.name}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <label className="chamados-check chamados-check-inline">
                <input
                  type="checkbox"
                  checked={onlyTechnicians}
                  onChange={(event) => setOnlyTechnicians(event.target.checked)}
                />
                Somente técnicos
              </label>
              {selectedTechnicians.length > 0 ? (
                <div className="chamados-tech-chips">
                  {selectedTechnicians.map((tech) => (
                    <span key={tech.id} className="chamados-tech-chip">
                      {tech.name}
                      <button type="button" onClick={() => handleRemoveTechnician(tech.id)}>
                        <LucideIcon name="x" className="chamados-tech-chip-icon" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="chamados-field">
              <label>Grupos Responsáveis (Opcional)</label>
              <div className="chamados-select">
                <input
                  type="text"
                  placeholder="Buscar grupo..."
                  value={groupQuery}
                  onChange={(event) => setGroupQuery(event.target.value)}
                  onFocus={() => setShowGroupDropdown(true)}
                  onBlur={() => setTimeout(() => setShowGroupDropdown(false), 120)}
                />
                <LucideIcon name="search" className="chamados-select-icon" />
                {showGroupDropdown && availableGroups.length > 0 ? (
                  <div className="chamados-select-dropdown">
                    {availableGroups.slice(0, 5).map((group) => (
                      <button
                        key={group.id}
                        type="button"
                        className="chamados-select-option"
                        onMouseDown={() => handleSelectGroup(group.id)}
                      >
                        {group.name}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              {selectedGroups.length > 0 ? (
                <div className="chamados-tech-chips">
                  {selectedGroups.map((groupId) => {
                    const group = groups.find((item) => item.id === groupId);
                    return (
                      <span key={groupId} className="chamados-tech-chip">
                        {group?.name ?? "Grupo"}
                        <button type="button" onClick={() => handleRemoveGroup(groupId)}>
                          <LucideIcon name="x" className="chamados-tech-chip-icon" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              ) : null}
            </div>
            <p className="chamados-help">
              O sistema enviará notificações para o usuário e/ou todos os membros dos grupos
              selecionados.
            </p>
          </div>
          {error ? <p className="chamados-error">{error}</p> : null}
        </div>

        <footer className="chamados-modal-footer">
          <Link className="chamados-modal-cancel" to="/chamados">
            Cancelar
          </Link>
          <button className="chamados-modal-save" type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar"}
          </button>
        </footer>
      </section>
    </div>
  );
}
