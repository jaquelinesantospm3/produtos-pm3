"use server";

import { revalidatePath } from "next/cache";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { gerarSlug } from "@/lib/formatacao";
import type { DadosProduto, Resultado, Status } from "@/lib/tipos";

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
function montarLinha(dados: DadosProduto) {
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
    dores: limparLista(dados.dores),
    diferenciais: limparLista(dados.diferenciais),
    modulos: limparLista(dados.modulos),
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
    evento_trilhas: ehEvento ? limparLista(dados.evento_trilhas) : [],
    evento_historico: ehEvento ? limpar(dados.evento_historico) || null : null,
    evento_nomes_palcos: ehEvento ? limparLista(dados.evento_nomes_palcos) : [],
    evento_patrocinadores: ehEvento
      ? (dados.evento_patrocinadores ?? [])
          .map((p) => ({ nome: limpar(p.nome), edicoes: limpar(p.edicoes) }))
          .filter((p) => p.nome)
      : [],
    evento_links_uteis: ehEvento
      ? (dados.evento_links_uteis ?? [])
          .map((l) => ({ label: limpar(l.label), url: normalizarUrl(l.url) }))
          .filter((l) => l.url)
      : [],
  };
}

/** Garante um endereço único para o produto (é o link que as pessoas compartilham). */
async function slugDisponivel(
  supabase: Awaited<ReturnType<typeof criarClienteServidor>>,
  base: string,
) {
  const raiz = base || "produto";
  let tentativa = raiz;
  let contador = 2;

  // Na prática para em uma ou duas voltas; o teto evita laço infinito.
  for (let i = 0; i < 50; i += 1) {
    const { data } = await supabase.from("produtos").select("id").eq("slug", tentativa).maybeSingle();
    if (!data) return tentativa;
    tentativa = `${raiz}-${contador}`;
    contador += 1;
  }
  return `${raiz}-${Date.now()}`;
}

async function sincronizarRelacionados(
  supabase: Awaited<ReturnType<typeof criarClienteServidor>>,
  produtoId: string,
  idsDesejados: string[],
) {
  const desejados = [...new Set(idsDesejados.filter((id) => id && id !== produtoId))];

  const { data: atuais } = await supabase
    .from("produto_relacionados")
    .select("relacionado_id")
    .eq("produto_id", produtoId);

  const existentes = (atuais ?? []).map((linha) => linha.relacionado_id as string);

  const paraAdicionar = desejados.filter((id) => !existentes.includes(id));
  const paraRemover = existentes.filter((id) => !desejados.includes(id));

  if (paraAdicionar.length > 0) {
    await supabase
      .from("produto_relacionados")
      .insert(paraAdicionar.map((id) => ({ produto_id: produtoId, relacionado_id: id })));
  }
  if (paraRemover.length > 0) {
    await supabase
      .from("produto_relacionados")
      .delete()
      .eq("produto_id", produtoId)
      .in("relacionado_id", paraRemover);
  }
}

/** Cria um produto novo. As datas e a assinatura são preenchidas pelo banco. */
export async function criarProduto(dados: DadosProduto): Promise<Resultado> {
  const supabase = await criarClienteServidor();

  const problema = validar(dados);
  if (problema) return { ok: false, erro: problema };

  const linha = montarLinha(dados);
  const slug = await slugDisponivel(supabase, gerarSlug(linha.nome_curto || linha.nome_oficial));

  const { data, error } = await supabase
    .from("produtos")
    .insert({ ...linha, slug })
    .select("id, slug")
    .single();

  if (error || !data) {
    return { ok: false, erro: "Não conseguimos salvar o produto agora. Tente de novo." };
  }

  await sincronizarRelacionados(supabase, data.id, dados.relacionados);

  revalidatePath("/");
  revalidatePath("/logs");
  revalidatePath("/manutencao");
  return { ok: true, slug: data.slug, mensagem: "Produto cadastrado com sucesso." };
}

/** Atualiza um produto existente. O endereço (link) não muda. */
export async function atualizarProduto(id: string, dados: DadosProduto): Promise<Resultado> {
  const supabase = await criarClienteServidor();

  const problema = validar(dados);
  if (problema) return { ok: false, erro: problema };

  const { data, error } = await supabase
    .from("produtos")
    .update(montarLinha(dados))
    .eq("id", id)
    .select("slug")
    .single();

  if (error || !data) {
    return { ok: false, erro: "Não conseguimos salvar as alterações agora. Tente de novo." };
  }

  await sincronizarRelacionados(supabase, id, dados.relacionados);

  revalidatePath("/");
  revalidatePath("/logs");
  revalidatePath("/manutencao");
  revalidatePath(`/produtos/${data.slug}`);
  return { ok: true, slug: data.slug, mensagem: "Alterações salvas." };
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
  const supabase = await criarClienteServidor();

  if (!limpar(campos.nome_oficial)) return { ok: false, erro: "Escreva o nome oficial do produto." };
  if (!limpar(campos.nome_responsavel)) {
    return { ok: false, erro: "Escreva o nome de quem responde pelo produto." };
  }

  const { data, error } = await supabase
    .from("produtos")
    .update({
      nome_oficial: limpar(campos.nome_oficial),
      nome_curto: limpar(campos.nome_curto) || limpar(campos.nome_oficial),
      categoria: campos.categoria,
      status: campos.status,
      time_responsavel: limpar(campos.time_responsavel),
      nome_responsavel: limpar(campos.nome_responsavel),
      revisado_por: limpar(campos.revisado_por),
      data_revisao: limpar(campos.data_revisao) || null,
    })
    .eq("id", id)
    .select("slug")
    .single();

  if (error || !data) {
    return { ok: false, erro: "Não conseguimos salvar as alterações agora. Tente de novo." };
  }

  revalidatePath("/");
  revalidatePath("/logs");
  revalidatePath("/manutencao");
  revalidatePath(`/produtos/${data.slug}`);
  return { ok: true, slug: data.slug, mensagem: "Alterações salvas." };
}
