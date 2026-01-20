import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { LucideIcon } from "../components/LucideIcon";
import {
  deleteDocumentVersion,
  getMe,
  listDocumentCategories,
  listDocuments,
  listDocumentVersions,
  updateDocument,
  uploadDocumentFile
} from "../lib/api";
import { Documentos } from "./Documentos";
import "../styles/documentos.css";
import "../styles/documentos-novo.css";

export function DocumentosEditar() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<
    Array<{ id: string; code: string; name: string }>
  >([]);
  const [versions, setVersions] = useState<
    Array<{
      id: string;
      document_id: string;
      file_name: string;
      version: string;
      created_at: string;
    }>
  >([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getMe(), listDocuments(), listDocumentCategories(), listDocumentVersions()])
      .then(([me, docs, cats, versionList]) => {
        if (!isMounted) return;
        setTenantId(me.profile?.tenant_id ?? null);
        setCategories(cats);
        setVersions(
          versionList.map((version) => ({
            id: version.id,
            document_id: version.document_id,
            file_name: version.file_name,
            version: version.version,
            created_at: version.created_at
          }))
        );
        const doc = docs.find((item) => item.id === id);
        if (!doc) {
          setError("Documento nao encontrado.");
          return;
        }
        setTitle(doc.title ?? "");
        if (doc.category_id) {
          setCategoryId(doc.category_id);
        } else {
          const match = cats.find((cat) => cat.name === doc.category);
          setCategoryId(match?.id ?? "");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Falha ao carregar documento.");
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const docVersions = versions.filter((version) => version.document_id === id);
  const latestVersion = docVersions.sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  )[0];

  const handleSave = async () => {
    if (!id) return;
    if (!title.trim()) {
      setError("Preencha o titulo do documento.");
      return;
    }
    if (!categoryId) {
      setError("Selecione a categoria.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      await updateDocument(id, {
        title: title.trim(),
        category_id: categoryId
      });
      if (file) {
        if (!tenantId) {
          setError("Tenant nao encontrado no perfil.");
          return;
        }
        const nextVersion = String(docVersions.length + 1 || 1);
        await uploadDocumentFile({
          document_id: id,
          tenant_id: tenantId,
          version: nextVersion,
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

  const handleDeleteFile = async () => {
    if (!latestVersion) return;
    const ok = window.confirm("Excluir o arquivo deste documento?");
    if (!ok) return;
    setError("");
    setIsSaving(true);
    try {
      await deleteDocumentVersion(latestVersion.id);
      setVersions((prev) => prev.filter((version) => version.id !== latestVersion.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao excluir arquivo.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="documentos-novo">
      <Documentos />

      <div className="documentos-modal-backdrop" aria-hidden="true" />

      <section className="documentos-modal" role="dialog" aria-label="Editar Documento">
        <header className="documentos-modal-header">
          <h2>Editar Documento</h2>
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
          </div>

          <div className="documentos-field">
            <label>Arquivo atual</label>
            <div className="documentos-file-row">
              <span className="documentos-file-name">
                {latestVersion?.file_name ?? "Nenhum arquivo enviado."}
              </span>
              {latestVersion ? (
                <button
                  className="documentos-file-delete"
                  type="button"
                  onClick={handleDeleteFile}
                  disabled={isSaving}
                >
                  Excluir
                </button>
              ) : null}
            </div>
          </div>

          <div className="documentos-field">
            <label htmlFor="doc-arquivo">Substituir arquivo</label>
            <input
              id="doc-arquivo"
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
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
