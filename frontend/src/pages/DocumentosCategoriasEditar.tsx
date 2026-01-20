import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Documentos } from "./Documentos";
import { LucideIcon } from "../components/LucideIcon";
import { listDocumentCategories, listDocuments, updateDocumentCategory } from "../lib/api";
import "../styles/documentos.css";
import "../styles/documentos-categorias.css";

export function DocumentosCategoriasEditar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUsed, setIsUsed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([listDocumentCategories(), listDocuments()])
      .then(([categories, docs]) => {
        if (!isMounted) return;
        const category = categories.find((item) => item.id === id);
        if (!category) {
          setError("Categoria nao encontrada.");
          return;
        }
        setCode(category.code);
        setName(category.name);
        const usedLookup = new Set(
          docs
            .map((doc) => doc.category?.toLowerCase().trim())
            .filter((value): value is string => Boolean(value))
        );
        const normalizedCode = category.code.toLowerCase().trim();
        const normalizedName = category.name.toLowerCase().trim();
        setIsUsed(usedLookup.has(normalizedCode) || usedLookup.has(normalizedName));
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Falha ao carregar categoria.");
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    if (!code || !name) {
      setError("Preencha codigo e categoria.");
      return;
    }
    if (isUsed) {
      setError("Categoria em uso. Nao e possivel alterar.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      await updateDocumentCategory(id, {
        code: code.trim().toUpperCase(),
        name: name.trim()
      });
      navigate("/documentos/categorias");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar categoria.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="documentos-categorias">
      <Documentos />

      <div className="documentos-modal-backdrop" aria-hidden="true" />

      <section className="documentos-modal" role="dialog" aria-label="Editar Categoria">
        <header className="documentos-modal-header">
          <h2>Editar Categoria</h2>
          <Link
            className="documentos-modal-close"
            to="/documentos/categorias"
            aria-label="Fechar"
          >
            <LucideIcon name="x" className="documentos-modal-close-icon" />
          </Link>
        </header>

        <div className="documentos-modal-body">
          <div className="documentos-field">
            <label htmlFor="doc-cat-code">Código</label>
            <input
              id="doc-cat-code"
              type="text"
              placeholder="Ex: DIAG"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              disabled={isUsed}
            />
          </div>
          <div className="documentos-field">
            <label htmlFor="doc-cat-name">Categoria</label>
            <input
              id="doc-cat-name"
              type="text"
              placeholder="Ex: Diagrama"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isUsed}
            />
          </div>
          {isUsed ? (
            <p className="documentos-error">Categoria em uso. Edicao bloqueada.</p>
          ) : null}
          {error ? <p className="documentos-error">{error}</p> : null}
        </div>

        <footer className="documentos-modal-footer">
          <Link className="documentos-modal-cancel" to="/documentos/categorias">
            Cancelar
          </Link>
          <button
            className="documentos-modal-save"
            type="button"
            onClick={handleSave}
            disabled={isSaving || isUsed}
          >
            {isSaving ? "Salvando..." : "Salvar"}
          </button>
        </footer>
      </section>
    </div>
  );
}
