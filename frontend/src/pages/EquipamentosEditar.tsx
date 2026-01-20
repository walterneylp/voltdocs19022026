import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Equipamentos } from "./Equipamentos";
import { LucideIcon } from "../components/LucideIcon";
import { getAuthUser } from "../lib/auth";
import { listAssets, listSites, updateAsset } from "../lib/api";
import "../styles/equipamentos.css";
import "../styles/equipamentos-novo.css";

export function EquipamentosEditar() {
  const authUser = getAuthUser();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const assetId = params.get("id");
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [patrimonyNumber, setPatrimonyNumber] = useState("");
  const [siteId, setSiteId] = useState("");
  const [description, setDescription] = useState("");
  const [voltage, setVoltage] = useState("");
  const [currentRating, setCurrentRating] = useState("0");
  const [atpv, setAtpv] = useState("0");
  const [riskLevel, setRiskLevel] = useState("BAIXO");
  const [sites, setSites] = useState<Array<{ id: string; name: string }>>([]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!assetId) {
      setError("Equipamento nao identificado.");
      return;
    }

    Promise.all([listAssets(), listSites()])
      .then(([assets, siteList]) => {
        if (!isMounted) return;
        const asset = assets.find((item) => item.id === assetId);
        if (!asset) {
          setError("Equipamento nao encontrado.");
          return;
        }
        setSites(siteList);
        setName(asset.name ?? "");
        setTag(asset.tag ?? "");
        setPatrimonyNumber(asset.patrimony_number ?? "");
        setSiteId(asset.site_id ?? "");
        setDescription("");
        setVoltage(asset.voltage ?? "");
        setCurrentRating(asset.current_rating != null ? String(asset.current_rating) : "0");
        setAtpv(asset.atpv != null ? String(asset.atpv) : "0");
        setRiskLevel(asset.risk_level ?? "BAIXO");
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Falha ao carregar equipamento.");
      });

    return () => {
      isMounted = false;
    };
  }, [assetId]);

  const handleSave = async () => {
    if (!assetId) {
      setError("Equipamento nao identificado.");
      return;
    }
    if (!name || !tag) {
      setError("Preencha nome e tag interna.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      await updateAsset(assetId, {
        name,
        tag,
        patrimony_number: patrimonyNumber || null,
        site_id: siteId || null,
        description: description || null,
        voltage: voltage || null,
        current_rating: currentRating ? Number(currentRating) : null,
        atpv: atpv ? Number(atpv) : null,
        risk_level: riskLevel || null
      });
      navigate("/equipamentos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar equipamento.");
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="equip-novo">
      <Equipamentos />

      <div className="equip-modal-backdrop" aria-hidden="true" />

      <section className="equip-modal" role="dialog" aria-label="Editar Equipamento">
        <header className="equip-modal-header">
          <h2>Editar Equipamento</h2>
          <Link className="equip-modal-close" to="/equipamentos" aria-label="Fechar">
            <LucideIcon name="x" className="equip-modal-close-icon" />
          </Link>
        </header>

        <div className="equip-modal-body">
          <div className="equip-modal-section">
            <p className="equip-modal-title">IDENTIFICAÇÃO</p>
            <div className="equip-grid-2">
              <div className="equip-field">
                <label htmlFor="equip-nome">Nome do Equipamento</label>
                <input
                  id="equip-nome"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="equip-field">
                <label htmlFor="equip-tag">Tag Interna</label>
                <input
                  id="equip-tag"
                  type="text"
                  value={tag}
                  onChange={(event) => setTag(event.target.value)}
                />
              </div>
              <div className="equip-field">
                <label htmlFor="equip-patrimonio">Núm. Patrimônio</label>
                <input
                  id="equip-patrimonio"
                  type="text"
                  placeholder="Ex: 001234"
                  value={patrimonyNumber}
                  onChange={(event) => setPatrimonyNumber(event.target.value)}
                />
              </div>
              <div className="equip-field">
                <label htmlFor="equip-local">Local (Site)</label>
                <select
                  id="equip-local"
                  value={siteId}
                  onChange={(event) => setSiteId(event.target.value)}
                >
                  <option value="">Buscar local...</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="equip-field">
              <label htmlFor="equip-descricao">Descrição Detalhada</label>
              <textarea
                id="equip-descricao"
                rows={3}
                placeholder="Função do equipamento, localização específica, detalhes..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          </div>

          <div className="equip-modal-section">
            <p className="equip-modal-title">DADOS ELÉTRICOS &amp; SEGURANÇA</p>
            <div className="equip-grid-3">
              <div className="equip-field">
                <label htmlFor="equip-tensao">Tensão (V)</label>
                <input
                  id="equip-tensao"
                  type="text"
                  value={voltage}
                  onChange={(event) => setVoltage(event.target.value)}
                />
              </div>
              <div className="equip-field">
                <label htmlFor="equip-corrente">Corrente Nom. (A)</label>
                <input
                  id="equip-corrente"
                  type="number"
                  value={currentRating}
                  onChange={(event) => setCurrentRating(event.target.value)}
                />
              </div>
              <div className="equip-field">
                <label htmlFor="equip-atpv">ATPV (cal/cm²)</label>
                <input
                  id="equip-atpv"
                  type="number"
                  value={atpv}
                  onChange={(event) => setAtpv(event.target.value)}
                />
              </div>
            </div>
            <div className="equip-field">
              <label htmlFor="equip-criticidade">Criticidade (Risco)</label>
              <select
                id="equip-criticidade"
                value={riskLevel}
                onChange={(event) => setRiskLevel(event.target.value)}
              >
                <option value="BAIXO">BAIXO</option>
                <option value="MÉDIO">MÉDIO</option>
                <option value="ALTO">ALTO</option>
                <option value="EXTREMO">EXTREMO</option>
              </select>
            </div>
            {error ? <p className="equip-error">{error}</p> : null}
          </div>
        </div>

        <footer className="equip-modal-footer">
          <Link className="equip-modal-cancel" to="/equipamentos">
            Cancelar
          </Link>
          <button
            className="equip-modal-save"
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
