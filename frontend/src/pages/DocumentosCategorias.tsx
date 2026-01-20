import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Documentos } from "./Documentos";
import { LucideIcon } from "../components/LucideIcon";
import {
  deleteDocumentCategory,
  listDocumentCategories,
  listDocuments
} from "../lib/api";
import "../styles/documentos.css";
import "../styles/documentos-categorias.css";

export function DocumentosCategorias() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Array<{ id: string; code: string; name: string }>>(
    []
  );
  const [documents, setDocuments] = useState<Array<{ id: string; category: string }>>([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([listDocumentCategories(), listDocuments()])
      .then(([data, docs]) => {
        if (!isMounted) return;
        setCategories(data);
        setDocuments(docs);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Falha ao carregar categorias.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? categories.filter((category) => {
        const haystack = `${category.code} ${category.name}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : categories;
  const dropdownOptions = filtered.slice(0, 10);
  const usedLookup = new Set(
    documents
      .map((doc) => doc.category?.toLowerCase().trim())
      .filter((value): value is string => Boolean(value))
  );

  const isCategoryUsed = (category: { code: string; name: string }) => {
    const code = category.code.toLowerCase().trim();
    const name = category.name.toLowerCase().trim();
    return usedLookup.has(code) || usedLookup.has(name);
  };

  const handleDelete = async (categoryId: string, categoryName: string) => {
    const ok = window.confirm(`Excluir categoria "${categoryName}"?`);
    if (!ok) return;
    setError("");
    setIsDeleting(categoryId);
    try {
      await deleteDocumentCategory(categoryId);
      setCategories((prev) => prev.filter((item) => item.id !== categoryId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao excluir categoria.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="documentos-categorias">
      <Documentos />

      <div className="documentos-modal-backdrop" aria-hidden="true" />

      <section className="documentos-modal" role="dialog" aria-label="Categorias">
        <header className="documentos-modal-header">
          <h2>Categorias de Documento</h2>
          <Link className="documentos-modal-close" to="/documentos" aria-label="Fechar">
            <LucideIcon name="x" className="documentos-modal-close-icon" />
          </Link>
        </header>

        <div className="documentos-modal-body">
          <div className="documentos-categories-header">
            <div>
              <p className="documentos-categories-title">Lista de categorias</p>
              <p className="documentos-categories-sub">
                Use categorias para organizar documentos e padronizar filtros.
              </p>
            </div>
            <Link className="documentos-categories-new" to="/documentos/categorias/novo">
              <LucideIcon name="plus" className="documentos-categories-new-icon" />
              Nova Categoria
            </Link>
          </div>

          <div className="documentos-categories-search">
            <label htmlFor="documentos-categories-search">Buscar categoria</label>
            <div className="documentos-input">
              <LucideIcon name="search" className="documentos-input-icon" />
              <input
                id="documentos-categories-search"
                type="text"
                placeholder="Digite o codigo ou nome"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setDropdownOpen(true)}
              />
              <button
                className="documentos-input-trigger"
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-label="Abrir opções de categorias"
              >
                <LucideIcon name="chevron-down" className="documentos-input-trigger-icon" />
              </button>
            </div>
            {dropdownOpen ? (
              <>
                <button
                  type="button"
                  className="documentos-categories-overlay"
                  aria-label="Fechar opções"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="documentos-dropdown documentos-categories-dropdown">
                  <button
                    type="button"
                    className="documentos-dropdown-item"
                    onClick={() => {
                      setQuery("");
                      setDropdownOpen(false);
                    }}
                  >
                    Todos
                  </button>
                  {dropdownOptions.map((category) => (
                    <button
                      type="button"
                      className="documentos-dropdown-item"
                      key={category.id}
                      onClick={() => {
                        setQuery(category.code);
                        setDropdownOpen(false);
                      }}
                    >
                      {category.code} - {category.name}
                    </button>
                  ))}
                  {dropdownOptions.length === 0 ? (
                    <div className="documentos-dropdown-empty">Nenhuma categoria encontrada.</div>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>

          {error ? <p className="documentos-error">{error}</p> : null}

          <div className="documentos-categories-table">
            <div className="documentos-categories-row documentos-categories-head">
              <div>Código</div>
              <div>Categoria</div>
              <div>Ações</div>
            </div>
            <div className="documentos-categories-body">
              {categories.length === 0 && !error ? (
                <div className="documentos-categories-row">
                  <div className="documentos-empty">Nenhuma categoria cadastrada.</div>
                </div>
              ) : null}
              {categories.length > 0 && filtered.length === 0 && !error ? (
                <div className="documentos-categories-row">
                  <div className="documentos-empty">Nenhuma categoria encontrada.</div>
                </div>
              ) : null}
              {filtered.map((category) => (
                <div
                  className={`documentos-categories-row ${
                    isCategoryUsed(category) ? "documentos-categories-row-disabled" : ""
                  }`}
                  key={category.id}
                >
                  <div className="documentos-categories-code">{category.code}</div>
                  <div className="documentos-categories-name">{category.name}</div>
                  <div className="documentos-categories-actions">
                    <button
                      type="button"
                      className="documentos-categories-action"
                      onClick={() => navigate(`/documentos/categorias/${category.id}`)}
                      disabled={isCategoryUsed(category)}
                      aria-disabled={isCategoryUsed(category)}
                      title={isCategoryUsed(category) ? "Categoria em uso" : "Editar"}
                    >
                      <LucideIcon name="pencil" className="documentos-categories-action-icon" />
                    </button>
                    <button
                      type="button"
                      className="documentos-categories-action documentos-categories-action-delete"
                      onClick={() => handleDelete(category.id, category.name)}
                      disabled={isCategoryUsed(category) || isDeleting === category.id}
                      aria-disabled={isCategoryUsed(category) || isDeleting === category.id}
                      title={
                        isCategoryUsed(category)
                          ? "Categoria em uso"
                          : isDeleting === category.id
                          ? "Excluindo..."
                          : "Excluir"
                      }
                    >
                      <LucideIcon name="trash-2" className="documentos-categories-action-icon" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="documentos-modal-footer">
          <Link className="documentos-modal-cancel" to="/documentos">
            Fechar
          </Link>
        </footer>
      </section>
    </div>
  );
}
