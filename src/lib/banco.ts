import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Produto, ProdutoResumo } from "@/lib/tipos";

/**
 * Acesso ao banco (Cloudflare D1) e ao repositório de arquivos (Cloudflare R2).
 *
 * Os dois chegam como "bindings" do Worker, declarados em wrangler.jsonc.
 * Não existe URL nem chave de API: a conexão é interna da Cloudflare.
 */

export async function banco(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}

export async function arquivos(): Promise<R2Bucket> {
  const { env } = await getCloudflareContext({ async: true });
  return env.PDF_BUCKET;
}

// ---------------------------------------------------------------------
// Conversão entre a linha do SQLite e o objeto que o aplicativo usa.
// O SQLite não tem coluna de lista, então listas viajam como texto JSON.
// ---------------------------------------------------------------------

/** Transforma texto JSON em lista. Se vier torto, devolve lista vazia. */
export function lerJson<T>(valor: unknown): T[] {
  if (Array.isArray(valor)) return valor as T[];
  if (typeof valor !== "string" || valor.trim() === "") return [];
  try {
    const dados = JSON.parse(valor);
    return Array.isArray(dados) ? (dados as T[]) : [];
  } catch {
    return [];
  }
}

/** Transforma lista em texto JSON para gravar. */
export function gravarJson(valor: unknown[] | undefined | null): string {
  return JSON.stringify(valor ?? []);
}

/** Monta o objeto Produto a partir da linha crua do banco. */
export function montarProduto(linha: Record<string, unknown>): Produto {
  return {
    ...(linha as unknown as Produto),
    dores: lerJson<string>(linha.dores),
    diferenciais: lerJson<string>(linha.diferenciais),
    modulos: lerJson<string>(linha.modulos),
    evento_trilhas: lerJson<string>(linha.evento_trilhas),
    evento_nomes_palcos: lerJson<string>(linha.evento_nomes_palcos),
    evento_patrocinadores: lerJson(linha.evento_patrocinadores),
    evento_links_uteis: lerJson(linha.evento_links_uteis),
  };
}

export function montarResumo(linha: Record<string, unknown>): ProdutoResumo {
  return linha as unknown as ProdutoResumo;
}

/** Campos lidos nas telas de lista e no seletor de relacionados. */
export const CAMPOS_RESUMO = "id, slug, nome_oficial, nome_curto, categoria, status";

/** Gera "?, ?, ?" com a quantidade pedida, para cláusulas IN. */
export function marcadores(quantidade: number): string {
  return new Array(quantidade).fill("?").join(", ");
}

/** Data e hora no formato que gravamos no banco. */
export function agora(): string {
  return new Date().toISOString();
}
