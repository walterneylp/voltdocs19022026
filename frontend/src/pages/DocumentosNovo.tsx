import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { LucideIcon } from "../components/LucideIcon";
import { getAuthUser } from "../lib/auth";
import {
  createDocument,
  getMe,
  linkDocumentEquipment,
  listAssets,
  listDocumentCategories,
  uploadDocumentFile
} from "../lib/api";
import { Documentos } from "./Documentos";
import "../styles/documentos.css";
import "../styles/documentos-novo.css";

export function DocumentosNovo() {
  const authUser = getAuthUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [assets, setAssets] = useState<Array<{ id: string; tag: string; name: string }>>(
    []
  );
  const [assetQuery, setAssetQuery] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<
    Array<{ id: string; tag: string; name: string }>
  >([]);
  const [dueDate, setDueDate] = useState("");
  const [fileName, setFileName] = useState("Nenhum arquivo escolhido");
  const [file, setFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<
    Array<{ id: string; code: string; name: string }>
  >([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getMe(), listDocumentCategories(), listAssets()])
      .then(([me, list, assetList]) => {
        if (!isMounted) return;
        setTenantId(me.profile.tenant_id ?? null);
        setCategories(list);
        setAssets(assetList);
        const equipmentId = searchParams.get("equipment_id");
        if (equipmentId) {
          const found = assetList.find((item) => item.id === equipmentId);
          if (found) {
            setSelectedAssets([found]);
            setAssetQuery("");
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Falha ao carregar categorias.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    if (!title) {
      setError("Preencha o titulo do documento.");
      return;
    }
    if (!categoryId) {
      setError("Selecione a categoria.");
      return;
    }
    if (!tenantId) {
      setError("Tenant nao encontrado no perfil.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      const categoryName =
        categories.find((item) => item.id === categoryId)?.name ?? undefined;
      const doc = await createDocument({
        title,
        category: categoryName,
        category_id: categoryId,
        tenant_id: tenantId
      });
      if (selectedAssets.length > 0) {
        await Promise.all(
          selectedAssets.map((asset) =>
            linkDocumentEquipment({
              document_id: doc.id,
              equipment_id: asset.id,
              tenant_id: tenantId
            })
          )
        );
      }
      if (file) {
        await uploadDocumentFile({
          document_id: doc.id,
          tenant_id: tenantId,
          version: "1",
          valid_until: dueDate ? new Date(dueDate).toISOString() : null,
          file
        });
      }
      navigate("/documentos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar documento.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredAssets = assets.filter((asset) => {
    if (!assetQuery) return true;
    const terms = assetQuery
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    return terms.some(
      (term) =>
        asset.tag.toLowerCase().includes(term) ||
        asset.name.toLowerCase().includes(term)
    );
  });

  const availableAssets = filteredAssets.filter(
    (asset) => !selectedAssets.some((item) => item.id === asset.id)
  );

  const handleSelectAsset = (asset: { id: string; tag: string; name: string }) => {
    if (selectedAssets.some((item) => item.id === asset.id)) return;
    setSelectedAssets((prev) => [...prev, asset]);
    setAssetQuery("");
  };

  const handleRemoveAsset = (id: string) => {
    setSelectedAssets((prev) => prev.filter((item) => item.id !== id));
  };

  const handleFilePick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileName(file ? file.name : "Nenhum arquivo escolhido");
    setFile(file ?? null);
  };
  return (
    <div className="documentos-novo">
      <Documentos />

      <div className="documentos-modal-backdrop" aria-hidden="true" />

      <section className="documentos-modal" role="dialog" aria-label="Novo Documento">
        <header className="documentos-modal-header">
          <h2>Novo Documento</h2>
          <Link className="documentos-modal-close" to="/documentos" aria-label="Fechar">
            <LucideIcon name="x" className="documentos-modal-close-icon" />
          </Link>
        </header>

        <div className="documentos-modal-body">
          <div className="documentos-field">
            <label htmlFor="doc-titulo">Título do Documento</label>
            <input
              id="doc-titulo"
              type="text"
              placeholder="Ex: Diagrama Unifilar v2"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="documentos-grid">
            <div className="documentos-field">
              <label htmlFor="doc-categoria">Categoria</label>
              <div className="documentos-select">
                <select
                  id="doc-categoria"
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                >
                  <option value="">Selecione...</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.code})
                    </option>
                  ))}
                </select>
                <LucideIcon name="chevron-down" className="documentos-select-icon" />
              </div>
            </div>
            <div className="documentos-field">
              <label htmlFor="doc-vencimento">Vencimento (Opcional)</label>
              <div className="documentos-date">
                <input
                  id="doc-vencimento"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
                <LucideIcon name="calendar" className="documentos-date-icon" />
              </div>
            </div>
          </div>

          <div className="documentos-field">
            <label>Equipamentos Associados (Opcional)</label>
            <div className="documentos-asset-picker">
              <div className="documentos-input">
                <LucideIcon name="search" className="documentos-input-icon" />
                <input
                  type="text"
                  placeholder="Buscar equipamento..."
                  value={assetQuery}
                  onChange={(event) => setAssetQuery(event.target.value)}
                />
              </div>
              <div className="documentos-asset-results">
                {availableAssets.length === 0 ? (
                  <span className="documentos-asset-empty">Nenhum equipamento encontrado.</span>
                ) : (
                  availableAssets.slice(0, 8).map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      className="documentos-asset-result"
                      onClick={() => handleSelectAsset(asset)}
                    >
                      <span className="documentos-asset-result-tag">{asset.tag}</span>
                      <span className="documentos-asset-result-name">{asset.name}</span>
                    </button>
                  ))
                )}
              </div>
              <div className="documentos-asset-chips">
                {selectedAssets.length === 0 ? (
                  <span className="documentos-asset-empty">Nenhum equipamento selecionado.</span>
                ) : (
                  selectedAssets.map((asset) => (
                    <span className="documentos-asset-chip" key={asset.id}>
                      {asset.tag}
                      <button type="button" onClick={() => handleRemoveAsset(asset.id)}>
                        <LucideIcon name="x" className="documentos-asset-chip-icon" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
            <p className="documentos-help">
              Selecione vários ou deixe em branco para documentos gerais.
            </p>
          </div>

          <div className="documentos-field">
            <label>Arquivo PDF</label>
            <div className="documentos-file">
              <button type="button" onClick={handleFilePick}>
                Escolher arquivo
              </button>
              <span>{fileName}</span>
              <input
                ref={fileInputRef}
                className="documentos-file-input"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </div>
          </div>
          {error ? <p className="documentos-error">{error}</p> : null}
        </div>

        <footer className="documentos-modal-footer">
          <Link className="documentos-modal-cancel" to="/documentos">
            Cancelar
          </Link>
          <button
            className="documentos-modal-save"
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
