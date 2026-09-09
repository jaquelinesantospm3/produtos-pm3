"use client";

import { AlertTriangle, RotateCw } from "lucide-react";

/**
 * Tela mostrada quando alguma coisa falha ao buscar os dados — quase sempre
 * é o banco fora do ar ou as variáveis de ambiente erradas. Sem jargão.
 */
export default function Erro({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-md px-5 py-16 text-center">
      <AlertTriangle size={22} className="mx-auto mb-3 text-pm3-descontinuado" />
      <h1 className="font-serif text-2xl text-pm3-ink">Não conseguimos carregar os produtos</h1>
      <p className="mx-auto mt-2 max-w-prosa text-sm text-pm3-muted">
        Pode ser uma instabilidade momentânea na conexão com o banco de dados. Tente de novo em
        alguns segundos.
      </p>
      <button type="button" onClick={reset} className="botao-primario mx-auto mt-5">
        <RotateCw size={15} /> Tentar de novo
      </button>
    </main>
  );
}
