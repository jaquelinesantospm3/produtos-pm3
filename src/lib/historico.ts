import "server-only";

/**
 * Histórico de alterações.
 *
 * No banco antigo isso era feito por gatilho do Postgres. O D1 não tem
 * gatilho com essa expressividade, então a comparação passou para cá.
 * Como toda escrita do sistema passa por src/actions/produtos.ts, o
 * resultado é o mesmo: nenhuma alteração escapa do log.
 */

/** Nome legível de cada campo, para o log não mostrar nome de coluna. */
const ROTULOS: Record<string, string> = {
  nome_oficial: "Nome oficial",
  nome_curto: "Nome curto",
  categoria: "Categoria",
  status: "Status",
  time_responsavel: "Time responsável",
  nome_responsavel: "Nome do responsável",
  resumo: "Resumo",
  proposta_valor: "Proposta de valor",
  publico_alvo: "Público-alvo",
  carga_horaria: "Carga horária",
  tempo_acesso: "Tempo de acesso",
  dores: "Dores",
  diferenciais: "Diferenciais",
  modulos: "Módulos",
  link_site: "Link do site",
  link_lp: "Link da landing page",
  pdf_nome: "PDF do produto",
  pdf_path: "PDF do produto",
  observacoes_lancamento: "Observações de lançamento",
  revisado_por: "Revisado por",
  data_revisao: "Data de revisão",
  evento_palestrantes: "Palestrantes",
  evento_palcos: "Palcos",
  evento_participantes: "Participantes",
  evento_local: "Local do evento",
  evento_trilhas: "Trilhas de conhecimento",
  evento_historico: "Histórico do evento",
  evento_nomes_palcos: "Nomes que já passaram pelos palcos",
  evento_patrocinadores: "Patrocinadores",
  evento_links_uteis: "Links úteis",
};

/** Campos que o sistema controla sozinho e que não geram log. */
const IGNORADOS = new Set([
  "id",
  "slug",
  "criado_em",
  "atualizado_em",
  "criado_por_email",
  "criado_por_nome",
  "atualizado_por_email",
  "atualizado_por_nome",
]);

/** Campos guardados como texto JSON: mudam de "lista" e não de "texto". */
const LISTAS = new Set([
  "dores",
  "diferenciais",
  "modulos",
  "evento_trilhas",
  "evento_nomes_palcos",
  "evento_patrocinadores",
  "evento_links_uteis",
]);

export function rotuloCampo(campo: string): string {
  return ROTULOS[campo] ?? campo;
}

function quantosItens(valor: unknown): number {
  if (typeof valor !== "string") return 0;
  try {
    const dados = JSON.parse(valor);
    return Array.isArray(dados) ? dados.length : 0;
  } catch {
    return 0;
  }
}

function comoTexto(valor: unknown): string {
  if (valor === null || valor === undefined || valor === "") return "(vazio)";
  return String(valor);
}

/** Frase curta descrevendo a mudança, em português. */
export function resumoMudanca(campo: string, antigo: unknown, novo: unknown): string {
  if (LISTAS.has(campo)) {
    return `Lista atualizada (de ${quantosItens(antigo)} para ${quantosItens(novo)} itens).`;
  }

  const de = comoTexto(antigo);
  const para = comoTexto(novo);

  if (de.length > 60 || para.length > 60) {
    return `Texto de "${rotuloCampo(campo)}" atualizado.`;
  }

  return `Alterado de "${de}" para "${para}".`;
}

export type Alteracao = { campo: string; resumo: string };

/**
 * Compara a linha que está no banco com a que vai ser gravada e devolve
 * uma alteração para cada campo que mudou de verdade.
 */
export function compararLinhas(
  antiga: Record<string, unknown>,
  nova: Record<string, unknown>,
): Alteracao[] {
  const alteracoes: Alteracao[] = [];

  for (const campo of Object.keys(nova)) {
    if (IGNORADOS.has(campo)) continue;

    const antes = antiga[campo] ?? null;
    const depois = nova[campo] ?? null;

    // Números e textos chegam com tipos diferentes do banco; comparamos o
    // conteúdo, para "3" e 3 não virarem uma alteração falsa.
    if (String(antes ?? "") === String(depois ?? "")) continue;

    alteracoes.push({
      campo: rotuloCampo(campo),
      resumo: resumoMudanca(campo, antes, depois),
    });
  }

  return alteracoes;
}
