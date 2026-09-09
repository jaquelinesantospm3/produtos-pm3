"use client";

import { useState } from "react";
import { Check, Copy, Printer } from "lucide-react";

/** Copiar link e exportar em PDF (pela impressão do navegador, com layout limpo). */
export default function AcoesOnePager() {
  const [copiado, setCopiado] = useState(false);

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Navegador sem permissão de área de transferência: mostramos o link
      // para a pessoa copiar manualmente.
      window.prompt("Copie o link deste produto:", window.location.href);
      return;
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  }

  return (
    <>
      <button type="button" onClick={copiarLink} className="botao-secundario text-xs">
        {copiado ? <Check size={13} /> : <Copy size={13} />}
        {copiado ? "Link copiado" : "Copiar link"}
      </button>
      <button type="button" onClick={() => window.print()} className="botao-secundario text-xs">
        <Printer size={13} /> Exportar PDF
      </button>
    </>
  );
}
