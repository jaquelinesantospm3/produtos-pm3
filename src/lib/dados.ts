import "server-only";
import { banco, montarProduto, montarResumo, marcadores, CAMPOS_RESUMO } from "@/lib/banco";
import type { Log, Produto, ProdutoComRelacionados, ProdutoResumo } from "@/lib/tipos";

/**
 * Leitura dos dados. Tudo vem do D1.
 *
 * A ordenação por nome é feita aqui no código, e não no SQL, porque o
 * SQLite ordena letra por letra pelo código do caractere — "Ágil" cairia
 * depois de "Zoom". O localeCompare em pt-BR resolve acento e maiúscula.
 */

function porNome<T extends { nome_oficial: string }>(lista: T[]): T[] {
  return lista.sort((a, b) => a.nome_oficial.localeCompare(b.nome_oficial, "pt-BR"));
}

export async function listarProdutos(): Promise<Produto[]> {
  const db = await banco();
  const { results } = await db.prepare("select * from produtos").all<Record<string, unknown>>();
  return porNome((results ?? []).map(montarProduto));
}

export async function listarProdutosResumidos(): Promise<ProdutoResumo[]> {
  const db = await banco();
  const { results } = await db
    .prepare(`select ${CAMPOS_RESUMO} from produtos`)
    .all<Record<string, unknown>>();
  return porNome((results ?? []).map(montarResumo));
}

export async function buscarProduto(slug: string): Promise<ProdutoComRelacionados | null> {
  const db = await banco();

  const linha = await db
    .prepare("select * from produtos where slug = ?")
    .bind(slug)
    .first<Record<string, unknown>>();

  if (!linha) return null;
  const produto = montarProduto(linha);

  const { results: vinculos } = await db
    .prepare("select relacionado_id from produto_relacionados where produto_id = ?")
    .bind(produto.id)
    .all<{ relacionado_id: string }>();

  const ids = (vinculos ?? []).map((v) => v.relacionado_id);

  let relacionados: ProdutoResumo[] = [];
  if (ids.length > 0) {
    const { results } = await db
      .prepare(`select ${CAMPOS_RESUMO} from produtos where id in (${marcadores(ids.length)})`)
      .bind(...ids)
      .all<Record<string, unknown>>();
    relacionados = porNome((results ?? []).map(montarResumo));
  }

  return { ...produto, relacionados };
}

export async function listarLogs(filtros?: {
  produtoId?: string;
  autorEmail?: string;
}): Promise<Log[]> {
  const db = await banco();

  const condicoes: string[] = [];
  const valores: string[] = [];

  if (filtros?.produtoId) {
    condicoes.push("produto_id = ?");
    valores.push(filtros.produtoId);
  }
  if (filtros?.autorEmail) {
    condicoes.push("autor_email = ?");
    valores.push(filtros.autorEmail);
  }

  const onde = condicoes.length > 0 ? `where ${condicoes.join(" and ")}` : "";
  const consulta = db
    .prepare(`select * from produto_logs ${onde} order by criado_em desc, id desc limit 500`)
    .bind(...valores);

  const { results } = await consulta.all<Log>();
  return results ?? [];
}

export async function listarLogsDoProduto(produtoId: string): Promise<Log[]> {
  return listarLogs({ produtoId });
}

/** Lista de pessoas que já alteraram alguma coisa, para o filtro da tela de logs. */
export async function listarAutores(): Promise<{ nome: string; email: string }[]> {
  const db = await banco();
  const { results } = await db
    .prepare(
      "select autor_email, max(autor_nome) as autor_nome from produto_logs group by autor_email",
    )
    .all<{ autor_email: string; autor_nome: string }>();

  return (results ?? [])
    .map((linha) => ({ email: linha.autor_email, nome: linha.autor_nome }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}
