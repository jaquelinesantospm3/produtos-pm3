"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, Plus, Search } from "lucide-react";
import SeloStatus from "@/components/SeloStatus";
import { CATEGORIAS, STATUS } from "@/lib/constantes";
import { ESTILO_STATUS, diasDesde, precisaRevisao } from "@/lib/formatacao";
import type { Produto } from "@/lib/tipos";

export default function ListaCatalogo({ produtos }: { produtos: Produto[] }) {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [status, setStatus] = useState("Todos");

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return produtos.filter((p) => {
      const combinaBusca =
        termo === "" ||
        `${p.nome_oficial} ${p.nome_curto} ${p.resumo}`.toLowerCase().includes(termo);
      const combinaCategoria = categoria === "Todas" || p.categoria === categoria;
      const combinaStatus = status === "Todos" || p.status === status;
      return combinaBusca && combinaCategoria && combinaStatus;
    });
  }, [produtos, busca, categoria, status]);

  const desatualizados = produtos.filter((p) => precisaRevisao(p.atualizado_em)).length;

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-pm3-ink">Catálogo de produtos</h1>
          <p className="mt-1 text-sm text-pm3-muted">
            {filtrados.length} de {produtos.length} produtos
            {desatualizados > 0 && (
              <>
                {" · "}
                <span className="text-pm3-descontinuado">
                  {desatualizados} {desatualizados === 1 ? "precisa" : "precisam"} de revisão
                </span>
              </>
            )}
          </p>
        </div>
        <Link href="/produtos/novo" className="botao-primario shrink-0">
          <Plus size={16} />
          <span className="hidden sm:inline">Cadastrar produto</span>
        </Link>
      </div>

      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-pm3-faint" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou descrição..."
          aria-label="Buscar produtos"
          className="campo pl-9"
        />
      </div>

      <Filtro
        rotulo="Categoria"
        opcoes={["Todas", ...CATEGORIAS]}
        selecionada={categoria}
        aoSelecionar={setCategoria}
      />
      <div className="mb-6">
        <Filtro
          rotulo="Status"
          opcoes={["Todos", ...STATUS]}
          selecionada={status}
          aoSelecionar={setStatus}
        />
      </div>

      {filtrados.length === 0 ? (
        <div className="rounded-xl border border-pm3-line bg-pm3-surface py-16 text-center">
          <p className="font-serif text-lg text-pm3-ink">Nenhum produto encontrado</p>
          <p className="mt-1 text-sm text-pm3-muted">Tente ajustar a busca ou os filtros.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtrados.map((p) => (
            <CardProduto key={p.id} produto={p} />
          ))}
        </div>
      )}
    </main>
  );
}

function Filtro({
  rotulo,
  opcoes,
  selecionada,
  aoSelecionar,
}: {
  rotulo: string;
  opcoes: string[];
  selecionada: string;
  aoSelecionar: (valor: string) => void;
}) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs text-pm3-faint">{rotulo}:</span>
      {opcoes.map((opcao) => {
        const ativa = selecionada === opcao;
        return (
          <button
            key={opcao}
            type="button"
            onClick={() => aoSelecionar(opcao)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
              ativa
                ? "border-pm3-ink bg-pm3-ink text-white"
                : "border-pm3-line text-pm3-muted hover:border-pm3-line-strong"
            }`}
          >
            {opcao}
          </button>
        );
      })}
    </div>
  );
}

function CardProduto({ produto }: { produto: Produto }) {
  const desatualizado = precisaRevisao(produto.atualizado_em);
  const estilo = ESTILO_STATUS[produto.status] ?? ESTILO_STATUS.Pausado;
  const tempo =
    produto.categoria === "Evento"
      ? produto.evento_participantes
        ? `${produto.evento_participantes} participantes`
        : ""
      : produto.carga_horaria;

  const detalhes = [produto.categoria, tempo, produto.time_responsavel].filter(Boolean);

  return (
    <Link
      href={`/produtos/${produto.slug}`}
      className={`block rounded-xl border border-pm3-line border-l-[3px] bg-pm3-surface p-5 transition-shadow hover:shadow-sm ${estilo.borda}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <SeloStatus status={produto.status} />
        {desatualizado && (
          <span className="flex items-center gap-1 text-xs font-medium text-pm3-descontinuado">
            <AlertTriangle size={12} /> Precisa de revisão
          </span>
        )}
      </div>
      <h2 className="mb-1 font-serif text-lg leading-snug text-pm3-ink">{produto.nome_oficial}</h2>
      <p className="mb-3 line-clamp-2 text-sm text-pm3-muted">{produto.resumo}</p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-pm3-faint">
        {detalhes.map((detalhe, i) => (
          <span key={detalhe} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden>·</span>}
            {detalhe}
          </span>
        ))}
      </div>
      {desatualizado && (
        <p className="mt-2 text-xs text-pm3-faint">
          Sem atualização há {diasDesde(produto.atualizado_em)} dias
        </p>
      )}
    </Link>
  );
}
