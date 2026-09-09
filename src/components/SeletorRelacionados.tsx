"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { ProdutoResumo } from "@/lib/tipos";

/**
 * Busca entre os produtos já cadastrados e cria um vínculo de verdade
 * (não é texto livre). Mostra até 6 sugestões enquanto a pessoa digita.
 */
export default function SeletorRelacionados({
  disponiveis,
  selecionados,
  aoMudar,
}: {
  disponiveis: ProdutoResumo[];
  selecionados: string[];
  aoMudar: (ids: string[]) => void;
}) {
  const [busca, setBusca] = useState("");

  const escolhidos = useMemo(
    () => selecionados.map((id) => disponiveis.find((p) => p.id === id)).filter(Boolean) as ProdutoResumo[],
    [selecionados, disponiveis],
  );

  const sugestoes = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (termo === "") return [];
    return disponiveis
      .filter((p) => !selecionados.includes(p.id))
      .filter((p) => `${p.nome_oficial} ${p.nome_curto}`.toLowerCase().includes(termo))
      .slice(0, 6);
  }, [busca, disponiveis, selecionados]);

  return (
    <div>
      {escolhidos.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {escolhidos.map((produto) => (
            <span
              key={produto.id}
              className="inline-flex items-center gap-1 rounded-full bg-pm3-accent-soft px-2.5 py-1 text-xs text-pm3-accent-ink"
            >
              {produto.nome_curto || produto.nome_oficial}
              <button
                type="button"
                onClick={() => aoMudar(selecionados.filter((id) => id !== produto.id))}
                aria-label={`Remover ${produto.nome_oficial}`}
                className="hover:opacity-70"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-pm3-faint" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Digite o nome de outro produto já cadastrado"
          className="campo-menor pl-9"
        />

        {sugestoes.length > 0 && (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-pm3-line bg-pm3-surface shadow-lg">
            {sugestoes.map((produto) => (
              <button
                key={produto.id}
                type="button"
                onClick={() => {
                  aoMudar([...selecionados, produto.id]);
                  setBusca("");
                }}
                className="block w-full px-3 py-2 text-left text-sm text-pm3-ink hover:bg-pm3-bg"
              >
                {produto.nome_oficial}
                <span className="ml-2 text-xs text-pm3-faint">{produto.categoria}</span>
              </button>
            ))}
          </div>
        )}

        {busca.trim() !== "" && sugestoes.length === 0 && (
          <p className="mt-1 text-xs text-pm3-faint">
            Nenhum produto encontrado com esse nome. Só dá para relacionar produtos já cadastrados.
          </p>
        )}
      </div>
    </div>
  );
}
