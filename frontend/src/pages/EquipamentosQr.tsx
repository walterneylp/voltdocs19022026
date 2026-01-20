import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Equipamentos } from "./Equipamentos";
import { LucideIcon } from "../components/LucideIcon";
import { getAuthUser } from "../lib/auth";
import { listAssets } from "../lib/api";
import "../styles/equipamentos.css";
import "../styles/equipamentos-qr.css";
import QRCode from "qrcode";

export function EquipamentosQr() {
  const authUser = getAuthUser();
  const [params] = useSearchParams();
  const assetId = params.get("id");
  const [qrData, setQrData] = useState("");
  const [asset, setAsset] = useState<{ tag: string; name: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    if (!assetId) {
      setError("Equipamento nao identificado.");
      return;
    }

    listAssets()
      .then((assets) => {
        if (!isMounted) return;
        const found = assets.find((item) => item.id === assetId);
        if (!found) {
          setError("Equipamento nao encontrado.");
          return;
        }
        const content = found.tag;
        setAsset({ tag: found.tag, name: found.name });
        QRCode.toDataURL(content, { width: 220, margin: 1 })
          .then((url: string) => {
            if (!isMounted) return;
            setQrData(url);
          })
          .catch(() => {
            if (!isMounted) return;
            setError("Falha ao gerar QR Code.");
          });
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Falha ao carregar equipamento.");
      });

    return () => {
      isMounted = false;
    };
  }, [assetId]);

  return (
    <div className="equip-qr">
      <Equipamentos />

      <div className="equip-qr-backdrop" aria-hidden="true" />
      <div className="equip-qr-print-only" aria-hidden="true">
        {qrData ? (
          <>
            <img className="equip-qr-print-image" src={qrData} alt="" />
            <div className="equip-qr-print-tag">{asset?.tag ?? ""}</div>
          </>
        ) : null}
      </div>

      <section className="equip-qr-modal" role="dialog" aria-label="QR Code do equipamento">
        <header className="equip-qr-header">
          <h2>QR Code: {asset?.tag ?? "—"}</h2>
          <Link className="equip-qr-close" to="/equipamentos" aria-label="Fechar">
            <LucideIcon name="x" className="equip-qr-close-icon" />
          </Link>
        </header>

        <div className="equip-qr-body">
          <div className="equip-qr-box" aria-hidden="true">
            {qrData ? (
              <img className="equip-qr-image" src={qrData} alt="QR Code do equipamento" />
            ) : (
              <div className="equip-qr-placeholder">Gerando QR...</div>
            )}
          </div>

          <div className="equip-qr-meta">
            <p className="equip-qr-tag">{asset?.tag ?? "—"}</p>
            <p className="equip-qr-name">{asset?.name ?? "—"}</p>
            <p className="equip-qr-content">Conteúdo: {asset?.tag ?? "—"}</p>
            {error ? <p className="equip-qr-error">{error}</p> : null}
          </div>
        </div>

        <footer className="equip-qr-footer">
          <button className="equip-qr-print" type="button" onClick={() => window.print()}>
            <LucideIcon name="printer" className="equip-qr-print-icon" />
            Imprimir Etiqueta
          </button>
          <Link className="equip-qr-action" to="/equipamentos">
            Fechar
          </Link>
        </footer>
      </section>
    </div>
  );
}
