import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  ExternalLink,
  FileText,
  Link2,
  Pencil,
} from "lucide-react";
import SeloStatus from "@/components/SeloStatus";
import AvisoSalvo from "@/components/AvisoSalvo";
import AcoesOnePager from "@/app/(app)/produtos/[slug]/AcoesOnePager";
import { buscarProduto, listarLogsDoProduto } from "@/lib/dados";
import { diasDesde, formatarData, precisaRevisao } from "@/lib/formatacao";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const produto = await buscarProduto(slug);
  return { title: produto ? `${produto.nome_oficial} · Produtos PM3` : "Produto não encontrado" };
}

export default async function PaginaOnePager({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const produto = await buscarProduto(slug);
  if (!produto) notFound();

  const historico = await listarLogsDoProduto(produto.id);
  const ehEvento = produto.categoria === "Evento";
  const desatualizado = precisaRevisao(produto.atualizado_em);

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
      <Suspense fallback={null}>
        <AvisoSalvo />
      </Suspense>

      <Link
        href="/"
        className="mb-6 flex items-center gap-1.5 text-sm text-pm3-muted hover:text-pm3-ink sem-impressao"
      >
        <ArrowLeft size={15} /> Catálogo
      </Link>

      <div className="mb-2 flex flex-wrap items-start justify-between gap-4">
        <SeloStatus status={produto.status} />
        <div className="flex gap-2 sem-impressao">
          <AcoesOnePager />
          <Link href={`/produtos/${produto.slug}/editar`} className="botao-secundario text-xs">
            <Pencil size={13} /> Editar
          </Link>
        </div>
      </div>

      <h1 className="mb-3 mt-3 font-serif text-4xl leading-tight text-pm3-ink">
        {produto.nome_oficial}
      </h1>
      <p className="max-w-prosa text-base leading-relaxed text-pm3-muted">{produto.resumo}</p>

      {desatualizado && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-pm3-descontinuado-soft px-3 py-2 text-sm text-pm3-descontinuado">
          <AlertTriangle size={14} />
          Este produto está há {diasDesde(produto.atualizado_em)} dias sem atualização.
        </div>
      )}

      <Secao titulo="Público">
        <p className="max-w-prosa text-sm leading-relaxed text-pm3-ink">
          {produto.publico_alvo || "Não informado."}
        </p>
      </Secao>

      {produto.proposta_valor && (
        <Secao titulo="Proposta de valor">
          <p className="max-w-prosa text-sm leading-relaxed text-pm3-ink">
            {produto.proposta_valor}
          </p>
        </Secao>
      )}

      <Secao titulo="Informações principais">
        {ehEvento ? (
          <div className="grid grid-cols-3 gap-6 sm:gap-10">
            <NumeroGrande valor={produto.evento_palestrantes} rotulo="Palestrantes" />
            <NumeroGrande valor={produto.evento_palcos} rotulo="Palcos" />
            <NumeroGrande valor={produto.evento_participantes} rotulo="Participantes" />
          </div>
        ) : (
          <div className="flex gap-8">
            <div>
              <p className="mb-0.5 text-xs text-pm3-faint">Carga horária</p>
              <p className="text-sm font-medium text-pm3-ink">{produto.carga_horaria || "—"}</p>
            </div>
            <div>
              <p className="mb-0.5 text-xs text-pm3-faint">Tempo de acesso</p>
              <p className="text-sm font-medium text-pm3-ink">{produto.tempo_acesso || "—"}</p>
            </div>
          </div>
        )}
      </Secao>

      {ehEvento && (
        <Secao titulo="Local do evento">
          <p className="text-sm text-pm3-ink">{produto.evento_local || "Não informado."}</p>
        </Secao>
      )}

      {ehEvento && produto.evento_trilhas.length > 0 && (
        <Secao titulo="Trilhas de conhecimento">
          <div className="flex flex-wrap gap-2">
            {produto.evento_trilhas.map((trilha) => (
              <span
                key={trilha}
                className="rounded-full bg-pm3-accent-soft px-2.5 py-1 text-xs font-medium text-pm3-accent-ink"
              >
                {trilha}
              </span>
            ))}
          </div>
        </Secao>
      )}

      <Secao titulo="Pontos para venda">
        <div className="grid gap-6 sm:grid-cols-2">
          <ListaComPonto titulo="Dores que resolve" itens={produto.dores} />
          <ListaComPonto titulo="Diferenciais" itens={produto.diferenciais} />
        </div>

        {produto.relacionados.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-pm3-ink">Produtos relacionados</p>
            <div className="flex flex-wrap gap-2">
              {produto.relacionados.map((relacionado) => (
                <Link
                  key={relacionado.id}
                  href={`/produtos/${relacionado.slug}`}
                  className="rounded-full bg-pm3-accent-soft px-2.5 py-1 text-xs font-medium text-pm3-accent-ink"
                >
                  {relacionado.nome_curto || relacionado.nome_oficial}
                </Link>
              ))}
            </div>
          </div>
        )}
      </Secao>

      <Secao titulo="Conteúdo">
        {produto.modulos.length === 0 ? (
          <p className="text-sm text-pm3-faint">Nenhum módulo cadastrado ainda.</p>
        ) : (
          <ol className="space-y-2">
            {produto.modulos.map((modulo, i) => (
              <li key={modulo} className="flex gap-3 text-sm text-pm3-ink">
                <span className="shrink-0 text-pm3-faint">{String(i + 1).padStart(2, "0")}</span>
                {modulo}
              </li>
            ))}
          </ol>
        )}
      </Secao>

      {ehEvento && (
        <Secao titulo="Histórico do evento">
          <p className="max-w-prosa text-sm leading-relaxed text-pm3-ink">
            {produto.evento_historico || "Nenhum histórico registrado ainda."}
          </p>
        </Secao>
      )}

      {ehEvento && produto.evento_nomes_palcos.length > 0 && (
        <Secao titulo="Quem já subiu ao palco">
          <div className="flex flex-wrap gap-2">
            {produto.evento_nomes_palcos.map((nome) => (
              <span
                key={nome}
                className="rounded-full bg-pm3-pausado-soft px-2.5 py-1 text-xs font-medium text-pm3-ink"
              >
                {nome}
              </span>
            ))}
          </div>
        </Secao>
      )}

      {ehEvento && produto.evento_patrocinadores.length > 0 && (
        <Secao titulo="Patrocinadores">
          <div className="space-y-2">
            {produto.evento_patrocinadores.map((patrocinador, i) => (
              <div
                key={`${patrocinador.nome}-${i}`}
                className={`flex items-baseline justify-between pb-2 text-sm ${
                  i < produto.evento_patrocinadores.length - 1 ? "border-b border-pm3-line" : ""
                }`}
              >
                <span className="text-pm3-ink">{patrocinador.nome}</span>
                <span className="text-pm3-faint">{patrocinador.edicoes}</span>
              </div>
            ))}
          </div>
        </Secao>
      )}

      <Secao titulo="Links oficiais">
        <div className="flex flex-col gap-2">
          {produto.link_site && (
            <a
              href={produto.link_site}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-pm3-accent-ink"
            >
              <ExternalLink size={14} /> Site oficial
            </a>
          )}
          {produto.link_lp && (
            <a
              href={produto.link_lp}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-pm3-accent-ink"
            >
              <Link2 size={14} /> Landing page
            </a>
          )}
          {produto.pdf_path ? (
            <a
              href={`/produtos/${produto.slug}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-pm3-accent-ink"
            >
              <FileText size={14} /> Baixar PDF ({produto.pdf_nome})
            </a>
          ) : (
            <p className="text-sm text-pm3-faint">Nenhum PDF cadastrado ainda.</p>
          )}
          {!produto.link_site && !produto.link_lp && (
            <p className="text-sm text-pm3-faint">Nenhum link cadastrado ainda.</p>
          )}
        </div>
      </Secao>

      {ehEvento && produto.evento_links_uteis.length > 0 && (
        <Secao titulo="Links úteis">
          <div className="flex flex-col gap-2">
            {produto.evento_links_uteis.map((link, i) => (
              <a
                key={`${link.url}-${i}`}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-pm3-accent-ink"
              >
                <Link2 size={14} /> {link.label || link.url}
              </a>
            ))}
          </div>
        </Secao>
      )}

      <div className="flex flex-wrap gap-x-8 gap-y-2 border-t border-pm3-line py-6 text-sm text-pm3-muted">
        <span>
          Atualizado em <strong className="text-pm3-ink">{formatarData(produto.atualizado_em)}</strong>
        </span>
        <span>
          Time responsável{" "}
          <strong className="text-pm3-ink">{produto.time_responsavel || "—"}</strong>
        </span>
        <span>
          Responsável <strong className="text-pm3-ink">{produto.nome_responsavel || "—"}</strong>
        </span>
        {produto.revisado_por && (
          <span>
            Revisado por <strong className="text-pm3-ink">{produto.revisado_por}</strong>
            {produto.data_revisao ? ` em ${formatarData(produto.data_revisao)}` : ""}
          </span>
        )}
      </div>

      {produto.observacoes_lancamento && (
        <Secao titulo="Observações de lançamento">
          <p className="max-w-prosa text-sm leading-relaxed text-pm3-ink">
            {produto.observacoes_lancamento}
          </p>
        </Secao>
      )}

      <Secao titulo="Histórico de atualizações">
        {historico.length === 0 ? (
          <p className="text-sm text-pm3-faint">Nenhuma alteração registrada ainda.</p>
        ) : (
          <div className="space-y-3">
            {historico.map((log) => (
              <div key={log.id} className="flex gap-3 text-sm">
                <Clock size={14} className="mt-0.5 shrink-0 text-pm3-faint" />
                <div>
                  <p className="text-pm3-ink">
                    <strong>{log.campo}</strong> — {log.resumo}
                  </p>
                  <p className="mt-0.5 text-xs text-pm3-faint">
                    {formatarData(log.criado_em)} · {log.autor_nome}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Secao>
    </main>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="evitar-quebra border-t border-pm3-line py-6">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.06em] text-pm3-faint">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function NumeroGrande({ valor, rotulo }: { valor: string | number | null; rotulo: string }) {
  const texto = valor === null || valor === "" ? "—" : String(valor);
  return (
    <div>
      <p className="font-serif text-3xl text-pm3-ink">{texto}</p>
      <p className="mt-1 text-xs text-pm3-faint">{rotulo}</p>
    </div>
  );
}

function ListaComPonto({ titulo, itens }: { titulo: string; itens: string[] }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-pm3-ink">{titulo}</p>
      {itens.length === 0 ? (
        <p className="text-sm text-pm3-faint">Nada cadastrado ainda.</p>
      ) : (
        <ul className="space-y-1.5">
          {itens.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-pm3-muted">
              <span className="text-pm3-accent">·</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
