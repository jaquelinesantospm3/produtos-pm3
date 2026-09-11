"use server";

import { revalidatePath } from "next/cache";
import { agora, banco, gravarJson, marcadores } from "@/lib/banco";
import { autorAtual, type Autor } from "@/lib/acesso";
import { compararLinhas, type Alteracao } from "@/lib/historico";
import { gerarSlug } from "@/lib/formatacao";
import type { DadosProduto, Resultado, Status } from "@/lib/tipos";

type Linha = Record<string, string | number | null>;

function limpar(texto: string | undefined | null) {
  return (texto ?? "").trim();
}

function limparLista(itens: string[] | undefined) {
  return (itens ?? []).map((item) => item.trim()).filter(Boolean);
}

/** Aceita "pm3.com.br/x" e guarda "https://pm3.com.br/x". */
function normalizarUrl(url: string) {
  const valor = limpar(url);
  if (valor === "") return "";
  if (/^https?:\/\//i.test(valor)) return valor;
  return `https://${valor}`;
}

function numeroOuNulo(valor: string) {
  const limpo = limpar(valor);
  if (limpo === "") return null;
  const numero = Number(limpo.replace(/\D/g, ""));
  return Number.isFinite(numero) ? numero : null;
}

function validar(dados: DadosProduto): string | null {
  if (!limpar(dados.nome_oficial)) return "Escreva o nome oficial do produto.";
  if (!dados.categoria) return "Escolha a categoria do produto.";
  if (!limpar(dados.time_responsavel)) return "Escolha o time responsável.";
  if (!limpar(dados.nome_responsavel)) return "Escreva o nome de quem responde pelo produto.";
  if (!dados.status) return "Escolha o status do produto.";
  return null;
}

/** Monta a linha da tabela a partir do que veio do formulário. */
function montarLinha(dados: DadosProduto): Linha {
  const ehEvento = dados.categoria === "Evento";

  return {
    nome_oficial: limpar(dados.nome_oficial),
    nome_curto: limpar(dados.nome_curto) || limpar(dados.nome_oficial),
    categoria: dados.categoria,
    status: dados.status as Status,
    time_responsavel: limpar(dados.time_responsavel),
    nome_responsavel: limpar(dados.nome_responsavel),

    resumo: limpar(dados.resumo),
    proposta_valor: limpar(dados.proposta_valor),
    publico_alvo: limpar(dados.publico_alvo),
    carga_horaria: limpar(dados.carga_horaria),
    tempo_acesso: limpar(dados.tempo_acesso),
    dores: gravarJson(limparLista(dados.dores)),
    diferenciais: gravarJson(limparLista(dados.diferenciais)),
    modulos: gravarJson(limparLista(dados.modulos)),
    link_site: normalizarUrl(dados.link_site),
    link_lp: normalizarUrl(dados.link_lp),
    pdf_nome: limpar(dados.pdf_nome),
    pdf_path: limpar(dados.pdf_path),

    observacoes_lancamento: limpar(dados.observacoes_lancamento),

    // Campos de evento só são gravados quando a categoria é Evento.
    // Em qualquer outra categoria eles ficam nulos/vazios na tabela.
    evento_palestrantes: ehEvento ? numeroOuNulo(dados.evento_palestrantes) : null,
    evento_palcos: ehEvento ? numeroOuNulo(dados.evento_palcos) : null,
    evento_participantes: ehEvento ? limpar(dados.evento_participantes) || null : null,
    evento_local: ehEvento ? limpar(dados.evento_local) || null : null,
    evento_trilhas: gravarJson(ehEvento ? limparLista(dados.evento_trilhas) : []),
    evento_historico: ehEvento ? limpar(dados.evento_historico) || null : null,
    evento_nomes_palcos: gravarJson(ehEvento ? limparLista(dados.evento_nomes_palcos) : []),
    evento_patrocinadores: gravarJson(
      ehEvento
        ? (dados.evento_patrocinadores ?? [])
            .map((p) => ({ nome: limpar(p.nome), edicoes: limpar(p.edicoes) }))
            .filter((p) => p.nome)
        : [],
    ),
    evento_links_uteis: gravarJson(
      ehEvento
        ? (dados.evento_links_uteis ?? [])
            .map((l) => ({ label: limpar(l.label), url: normalizarUrl(l.url) }))
            .filter((l) => l.url)
        : [],
    ),
  };
}

// ---------------------------------------------------------------------
// Montagem de SQL. As colunas saem do próprio objeto, para não existir
// uma segunda lista de campos que precise ser mantida em dia.
// ---------------------------------------------------------------------

function sqlInserir(tabela: string, linha: Linha) {
  const colunas = Object.keys(linha);
  return {
    sql: `insert into ${tabela} (${colunas.join(", ")}) values (${marcadores(colunas.length)})`,
    valores: colunas.map((coluna) => linha[coluna]),
  };
}

function sqlAtualizar(tabela: string, linha: Linha, colunaFiltro: string, valorFiltro: string) {
  const colunas = Object.keys(linha);
  const atribuicoes = colunas.map((coluna) => `${coluna} = ?`).join(", ");
  return {
    sql: `update ${tabela} set ${atribuicoes} where ${colunaFiltro} = ?`,
    valores: [...colunas.map((coluna) => linha[coluna]), valorFiltro],
  };
}

/** Uma linha de log pronta para gravar. */
function linhaDeLog(
  produtoId: string | null,
  produtoNome: string,
  campo: string,
  resumo: string,
  autor: Autor,
  quando: string,
): Linha {
  return {
    produto_id: produtoId,
    produto_nome: produtoNome,
    campo,
    resumo,
    autor_nome: autor.nome,
    autor_email: autor.email,
    criado_em: quando,
  };
}

async function gravarLogs(
  db: D1Database,
  produtoId: string,
  produtoNome: string,
  alteracoes: Alteracao[],
  autor: Autor,
  quando: string,
) {
  if (alteracoes.length === 0) return;

  await db.batch(
    alteracoes.map((alteracao) => {
      const { sql, valores } = sqlInserir(
        "produto_logs",
        linhaDeLog(produtoId, produtoNome, alteracao.campo, alteracao.resumo, autor, quando),
      );
      return db.prepare(sql).bind(...valores);
    }),
  );
}

/** Garante um endereço único para o produto (é o link que as pessoas compartilham). */
async function slugDisponivel(db: D1Database, base: string) {
  const raiz = base || "produto";
  let tentativa = raiz;
  let contador = 2;

  // Na prática para em uma ou duas voltas; o teto evita laço infinito.
  for (let i = 0; i < 50; i += 1) {
    const existente = await db
      .prepare("select id from produtos where slug = ?")
      .bind(tentativa)
      .first<{ id: string }>();
    if (!existente) return tentativa;
    tentativa = `${raiz}-${contador}`;
    contador += 1;
  }
  return `${raiz}-${Date.now()}`;
}

/** Acerta os vínculos e registra no histórico cada um que entrou ou saiu. */
async function sincronizarRelacionados(
  db: D1Database,
  produtoId: string,
  produtoNome: string,
  idsDesejados: string[],
  autor: Autor,
  quando: string,
) {
  const desejados = [...new Set(idsDesejados.filter((id) => id && id !== produtoId))];

  const { results: atuais } = await db
    .prepare("select relacionado_id from produto_relacionados where produto_id = ?")
    .bind(produtoId)
    .all<{ relacionado_id: string }>();

  const existentes = (atuais ?? []).map((linha) => linha.relacionado_id);

  const paraAdicionar = desejados.filter((id) => !existentes.includes(id));
  const paraRemover = existentes.filter((id) => !desejados.includes(id));

  if (paraAdicionar.length === 0 && paraRemover.length === 0) return;

  // Nomes só dos produtos envolvidos, para a frase do log ficar legível.
  const envolvidos = [...paraAdicionar, ...paraRemover];
  const { results: nomes } = await db
    .prepare(
      `select id, nome_curto, nome_oficial from produtos where id in (${marcadores(envolvidos.length)})`,
    )
    .bind(...envolvidos)
    .all<{ id: string; nome_curto: string; nome_oficial: string }>();

  const nomePorId = new Map(
    (nomes ?? []).map((linha) => [linha.id, linha.nome_curto || linha.nome_oficial]),
  );

  const comandos: D1PreparedStatement[] = [];

  for (const id of paraAdicionar) {
    comandos.push(
      db
        .prepare(
          "insert or ignore into produto_relacionados (produto_id, relacionado_id) values (?, ?)",
        )
        .bind(produtoId, id),
    );
    const { sql, valores } = sqlInserir(
      "produto_logs",
      linhaDeLog(
        produtoId,
        produtoNome,
        "Produtos relacionados",
        `Vinculado ao produto "${nomePorId.get(id) ?? "?"}".`,
        autor,
        quando,
      ),
    );
    comandos.push(db.prepare(sql).bind(...valores));
  }

  if (paraRemover.length > 0) {
    comandos.push(
      db
        .prepare(
          `delete from produto_relacionados where produto_id = ? and relacionado_id in (${marcadores(paraRemover.length)})`,
        )
        .bind(produtoId, ...paraRemover),
    );
    for (const id of paraRemover) {
      const { sql, valores } = sqlInserir(
        "produto_logs",
        linhaDeLog(
          produtoId,
          produtoNome,
          "Produtos relacionados",
          `Removido o vínculo com "${nomePorId.get(id) ?? "?"}".`,
          autor,
          quando,
        ),
      );
      comandos.push(db.prepare(sql).bind(...valores));
    }
  }

  await db.batch(comandos);
}

function atualizarTelas(slug?: string) {
  revalidatePath("/");
  revalidatePath("/logs");
  revalidatePath("/manutencao");
  if (slug) revalidatePath(`/produtos/${slug}`);
}

/** Cria um produto novo. As datas e a assinatura são preenchidas pelo sistema. */
export async function criarProduto(dados: DadosProduto): Promise<Resultado> {
  const problema = validar(dados);
  if (problema) return { ok: false, erro: problema };

  const db = await banco();
  const autor = await autorAtual();
  const quando = agora();

  const campos = montarLinha(dados);
  const id = crypto.randomUUID();
  const slug = await slugDisponivel(db, gerarSlug(String(campos.nome_curto || campos.nome_oficial)));
  const nome = String(campos.nome_oficial);

  const linha: Linha = {
    id,
    slug,
    ...campos,
    revisado_por: "",
    data_revisao: null,
    criado_em: quando,
    atualizado_em: quando,
    criado_por_email: autor.email,
    criado_por_nome: autor.nome,
    atualizado_por_email: autor.email,
    atualizado_por_nome: autor.nome,
  };

  try {
    const { sql, valores } = sqlInserir("produtos", linha);
    await db
      .prepare(sql)
      .bind(...valores)
      .run();

    await gravarLogs(
      db,
      id,
      nome,
      [{ campo: "Cadastro", resumo: "Produto cadastrado pela primeira vez." }],
      autor,
      quando,
    );
    await sincronizarRelacionados(db, id, nome, dados.relacionados, autor, quando);
  } catch {
    return { ok: false, erro: "Não conseguimos salvar o produto agora. Tente de novo." };
  }

  atualizarTelas(slug);
  return { ok: true, slug, mensagem: "Produto cadastrado com sucesso." };
}

/** Atualiza um produto existente. O endereço (link) não muda. */
export async function atualizarProduto(id: string, dados: DadosProduto): Promise<Resultado> {
  const problema = validar(dados);
  if (problema) return { ok: false, erro: problema };

  const db = await banco();
  const autor = await autorAtual();
  const quando = agora();

  const anterior = await db
    .prepare("select * from produtos where id = ?")
    .bind(id)
    .first<Record<string, unknown>>();

  if (!anterior) return { ok: false, erro: "Este produto não existe mais." };

  const campos = montarLinha(dados);
  const nome = String(campos.nome_oficial);
  const slug = String(anterior.slug);
  const alteracoes = compararLinhas(anterior, campos);

  try {
    const { sql, valores } = sqlAtualizar(
      "produtos",
      {
        ...campos,
        atualizado_em: quando,
        atualizado_por_email: autor.email,
        atualizado_por_nome: autor.nome,
      },
      "id",
      id,
    );
    await db
      .prepare(sql)
      .bind(...valores)
      .run();

    await gravarLogs(db, id, nome, alteracoes, autor, quando);
    await sincronizarRelacionados(db, id, nome, dados.relacionados, autor, quando);
  } catch {
    return { ok: false, erro: "Não conseguimos salvar as alterações agora. Tente de novo." };
  }

  atualizarTelas(slug);
  return { ok: true, slug, mensagem: "Alterações salvas." };
}

/** Edição rápida dos campos de governança (tela de Manutenção). */
export async function salvarGovernanca(
  id: string,
  campos: {
    nome_oficial: string;
    nome_curto: string;
    categoria: string;
    status: string;
    time_responsavel: string;
    nome_responsavel: string;
    revisado_por: string;
    data_revisao: string;
  },
): Promise<Resultado> {
  if (!limpar(campos.nome_oficial)) return { ok: false, erro: "Escreva o nome oficial do produto." };
  if (!limpar(campos.nome_responsavel)) {
    return { ok: false, erro: "Escreva o nome de quem responde pelo produto." };
  }

  const db = await banco();
  const autor = await autorAtual();
  const quando = agora();

  const anterior = await db
    .prepare("select * from produtos where id = ?")
    .bind(id)
    .first<Record<string, unknown>>();

  if (!anterior) return { ok: false, erro: "Este produto não existe mais." };

  const novos: Linha = {
    nome_oficial: limpar(campos.nome_oficial),
    nome_curto: limpar(campos.nome_curto) || limpar(campos.nome_oficial),
    categoria: campos.categoria,
    status: campos.status,
    time_responsavel: limpar(campos.time_responsavel),
    nome_responsavel: limpar(campos.nome_responsavel),
    revisado_por: limpar(campos.revisado_por),
    data_revisao: limpar(campos.data_revisao) || null,
  };

  const slug = String(anterior.slug);
  const alteracoes = compararLinhas(anterior, novos);

  try {
    const { sql, valores } = sqlAtualizar(
      "produtos",
      {
        ...novos,
        atualizado_em: quando,
        atualizado_por_email: autor.email,
        atualizado_por_nome: autor.nome,
      },
      "id",
      id,
    );
    await db
      .prepare(sql)
      .bind(...valores)
      .run();

    await gravarLogs(db, id, String(novos.nome_oficial), alteracoes, autor, quando);
  } catch {
    return { ok: false, erro: "Não conseguimos salvar as alterações agora. Tente de novo." };
  }

  atualizarTelas(slug);
  return { ok: true, slug, mensagem: "Alterações salvas." };
}
