"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, Check, ExternalLink, Loader2 } from "lucide-react";
import { Campo } from "@/components/campos";
import { CATEGORIAS, STATUS, TIMES } from "@/lib/constantes";
import { formatarData, precisaRevisao } from "@/lib/formatacao";
import { salvarGovernanca } from "@/actions/produtos";
import type { Produto } from "@/lib/tipos";

type Formulario = {
  nome_oficial: string;
  nome_curto: string;
  categoria: string;
  status: string;
  time_responsavel: string;
  nome_responsavel: string;
  revisado_por: string;
  data_revisao: string;
};

function aPartirDoProduto(produto: Produto): Formulario {
  return {
    nome_oficial: produto.nome_oficial,
    nome_curto: produto.nome_curto,
    categoria: produto.categoria,
    status: produto.status,
    time_responsavel: produto.time_responsavel,
    nome_responsavel: produto.nome_responsavel,
    revisado_por: produto.revisado_por,
    data_revisao: produto.data_revisao ?? "",
  };
}

export default function PainelManutencao({ produtos }: { produtos: Produto[] }) {
  const router = useRouter();
  const [selecionadoId, setSelecionadoId] = useState(produtos[0]?.id ?? "");
  const [formulario, setFormulario] = useState<Formulario | null>(
    produtos[0] ? aPartirDoProduto(produtos[0]) : null,
  );
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState("");

  const selecionado = produtos.find((produto) => produto.id === selecionadoId);

  function selecionar(produto: Produto) {
    setSelecionadoId(produto.id);
    setFormulario(aPartirDoProduto(produto));
    setSalvo(false);
    setErro("");
  }

  function set<K extends keyof Formulario>(campo: K, valor: Formulario[K]) {
    setFormulario((atual) => (atual ? { ...atual, [campo]: valor } : atual));
    setSalvo(false);
  }

  async function salvar() {
    if (!formulario || !selecionado) return;
    setErro("");
    setSalvando(true);
    const resultado = await salvarGovernanca(selecionado.id, formulario);
    setSalvando(false);

    if (!resultado.ok) {
      setErro(resultado.erro);
      return;
    }

    setSalvo(true);
    router.refresh();
    setTimeout(() => setSalvo(false), 2500);
  }

  if (produtos.length === 0) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        <h1 className="font-serif text-2xl text-pm3-ink">Manutenção</h1>
        <p className="mt-2 text-sm text-pm3-muted">
          Nenhum produto cadastrado ainda.{" "}
          <Link href="/produtos/novo" className="text-pm3-accent-ink underline">
            Cadastrar o primeiro
          </Link>
          .
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-5 py-8 sm:px-8 md:grid-cols-[240px_1fr]">
      <div>
        <h1 className="mb-1 font-serif text-2xl text-pm3-ink">Manutenção</h1>
        <p className="mb-4 text-sm text-pm3-muted">Revise os dados essenciais de governança.</p>
        <div className="space-y-1">
          {produtos.map((produto) => {
            const ativo = produto.id === selecionadoId;
            return (
              <button
                key={produto.id}
                type="button"
                onClick={() => selecionar(produto)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                  ativo ? "bg-pm3-accent-soft text-pm3-accent-ink" : "text-pm3-ink hover:bg-pm3-surface"
                }`}
              >
                <span className="truncate">{produto.nome_curto || produto.nome_oficial}</span>
                {precisaRevisao(produto.atualizado_em) && (
                  <AlertTriangle size={13} className="shrink-0 text-pm3-descontinuado" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {formulario && selecionado && (
        <div className="rounded-xl border border-pm3-line bg-pm3-surface p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-xs text-pm3-faint">
              Editando <strong className="text-pm3-ink">{selecionado.nome_oficial}</strong>
            </p>
            <Link
              href={`/produtos/${selecionado.slug}`}
              className="flex shrink-0 items-center gap-1 text-xs font-medium text-pm3-accent-ink"
            >
              Ver página <ExternalLink size={12} />
            </Link>
          </div>

          <div className="grid gap-x-4 sm:grid-cols-2">
            <Campo rotulo="Nome oficial">
              <input
                value={formulario.nome_oficial}
                onChange={(e) => set("nome_oficial", e.target.value)}
                className="campo"
              />
            </Campo>
            <Campo rotulo="Nome curto">
              <input
                value={formulario.nome_curto}
                onChange={(e) => set("nome_curto", e.target.value)}
                className="campo"
              />
            </Campo>
            <Campo rotulo="Categoria">
              <select
                value={formulario.categoria}
                onChange={(e) => set("categoria", e.target.value)}
                className="campo"
              >
                {CATEGORIAS.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Status">
              <select
                value={formulario.status}
                onChange={(e) => set("status", e.target.value)}
                className="campo"
              >
                {STATUS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Time responsável">
              <select
                value={formulario.time_responsavel}
                onChange={(e) => set("time_responsavel", e.target.value)}
                className="campo"
              >
                <option value="">Selecione um time</option>
                {TIMES.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Nome do responsável">
              <input
                value={formulario.nome_responsavel}
                onChange={(e) => set("nome_responsavel", e.target.value)}
                className="campo"
              />
            </Campo>
            <Campo rotulo="Revisado por" dica="Quem conferiu que os dados estão corretos">
              <input
                value={formulario.revisado_por}
                onChange={(e) => set("revisado_por", e.target.value)}
                className="campo"
              />
            </Campo>
            <Campo rotulo="Data da revisão">
              <input
                type="date"
                value={formulario.data_revisao}
                onChange={(e) => set("data_revisao", e.target.value)}
                className="campo"
              />
            </Campo>
          </div>

          <p className="mb-4 mt-1 text-xs text-pm3-faint">
            Última atualização automática: {formatarData(selecionado.atualizado_em)} por{" "}
            {selecionado.atualizado_por_nome || "—"} (preenchida pelo sistema, não editável aqui).
          </p>

          {erro && (
            <p className="mb-3 flex items-start gap-2 rounded-lg bg-pm3-descontinuado-soft px-3 py-2 text-sm text-pm3-descontinuado">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              {erro}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={salvar}
              disabled={salvando}
              className={`botao-primario ${salvo ? "!bg-pm3-ativo" : ""}`}
            >
              {salvando ? (
                <Loader2 size={15} className="animate-spin" />
              ) : salvo ? (
                <Check size={15} />
              ) : null}
              {salvando ? "Salvando..." : salvo ? "Salvo!" : "Salvar alterações"}
            </button>
            <Link
              href={`/produtos/${selecionado.slug}/editar`}
              className="text-xs font-medium text-pm3-accent-ink"
            >
              Editar todos os campos deste produto
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
