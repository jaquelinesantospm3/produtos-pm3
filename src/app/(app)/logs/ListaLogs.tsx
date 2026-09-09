"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatarData } from "@/lib/formatacao";
import type { Log, ProdutoResumo } from "@/lib/tipos";

export default function ListaLogs({
  logs,
  produtos,
  autores,
}: {
  logs: Log[];
  produtos: ProdutoResumo[];
  autores: { nome: string; email: string }[];
}) {
  const [produtoId, setProdutoId] = useState("Todos");
  const [autorEmail, setAutorEmail] = useState("Todos");

  const filtrados = useMemo(
    () =>
      logs
        .filter((log) => produtoId === "Todos" || log.produto_id === produtoId)
        .filter((log) => autorEmail === "Todos" || log.autor_email === autorEmail),
    [logs, produtoId, autorEmail],
  );

  const slugPorId = useMemo(
    () => new Map(produtos.map((produto) => [produto.id, produto.slug])),
    [produtos],
  );

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
      <h1 className="mb-1 font-serif text-3xl text-pm3-ink">Logs de alteração</h1>
      <p className="mb-6 text-sm text-pm3-muted">
        Todo ajuste feito em qualquer produto, com data e responsável. O registro é automático.
      </p>

      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={produtoId}
          onChange={(e) => setProdutoId(e.target.value)}
          aria-label="Filtrar por produto"
          className="campo-menor w-auto"
        >
          <option value="Todos">Todos os produtos</option>
          {produtos.map((produto) => (
            <option key={produto.id} value={produto.id}>
              {produto.nome_oficial}
            </option>
          ))}
        </select>

        <select
          value={autorEmail}
          onChange={(e) => setAutorEmail(e.target.value)}
          aria-label="Filtrar por pessoa"
          className="campo-menor w-auto"
        >
          <option value="Todos">Todas as pessoas</option>
          {autores.map((autor) => (
            <option key={autor.email} value={autor.email}>
              {autor.nome}
            </option>
          ))}
        </select>

        {(produtoId !== "Todos" || autorEmail !== "Todos") && (
          <button
            type="button"
            onClick={() => {
              setProdutoId("Todos");
              setAutorEmail("Todos");
            }}
            className="text-xs font-medium text-pm3-accent-ink"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {filtrados.length === 0 ? (
        <div className="rounded-xl border border-pm3-line bg-pm3-surface py-16 text-center">
          <p className="text-sm text-pm3-muted">Nenhum registro encontrado para esse filtro.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-pm3-line">
          {filtrados.map((log, i) => {
            const slug = log.produto_id ? slugPorId.get(log.produto_id) : undefined;
            return (
              <div
                key={log.id}
                className={`flex flex-wrap gap-x-6 gap-y-1 bg-pm3-surface px-5 py-4 text-sm ${
                  i > 0 ? "border-t border-pm3-line" : ""
                }`}
              >
                <span className="w-28 shrink-0 text-pm3-faint">{formatarData(log.criado_em)}</span>
                <span className="w-48 shrink-0 font-medium text-pm3-ink">
                  {slug ? (
                    <Link href={`/produtos/${slug}`} className="hover:underline">
                      {log.produto_nome}
                    </Link>
                  ) : (
                    log.produto_nome
                  )}
                </span>
                <span className="w-40 shrink-0 text-pm3-muted">{log.campo}</span>
                <span className="flex-1 text-pm3-muted">{log.resumo}</span>
                <span className="text-pm3-accent-ink" title={log.autor_email}>
                  {log.autor_nome}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-xs text-pm3-faint">
        Mostrando as {logs.length} alterações mais recentes.
      </p>
    </main>
  );
}
