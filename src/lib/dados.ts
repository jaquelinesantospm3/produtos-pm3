import "server-only";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { Log, Perfil, Produto, ProdutoComRelacionados, ProdutoResumo } from "@/lib/tipos";

const CAMPOS_RESUMO = "id, slug, nome_oficial, nome_curto, categoria, status";

/** Perfil de quem está logado (nome e e-mail que assinam as alterações). */
export async function perfilAtual(): Promise<Perfil | null> {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("perfis")
    .select("id, email, nome")
    .eq("id", user.id)
    .maybeSingle();

  // Se o gatilho de criação de perfil ainda não rodou, mostramos o e-mail.
  return data ?? { id: user.id, email: user.email ?? "", nome: user.email ?? "" };
}

export async function listarProdutos(): Promise<Produto[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .order("nome_oficial", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Produto[];
}

export async function listarProdutosResumidos(): Promise<ProdutoResumo[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("produtos")
    .select(CAMPOS_RESUMO)
    .order("nome_oficial", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as ProdutoResumo[];
}

export async function buscarProduto(slug: string): Promise<ProdutoComRelacionados | null> {
  const supabase = await criarClienteServidor();

  const { data: produto } = await supabase
    .from("produtos")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!produto) return null;

  const { data: vinculos } = await supabase
    .from("produto_relacionados")
    .select("relacionado_id")
    .eq("produto_id", produto.id);

  const ids = (vinculos ?? []).map((v) => v.relacionado_id);

  let relacionados: ProdutoResumo[] = [];
  if (ids.length > 0) {
    const { data } = await supabase
      .from("produtos")
      .select(CAMPOS_RESUMO)
      .in("id", ids)
      .order("nome_oficial", { ascending: true });
    relacionados = (data ?? []) as ProdutoResumo[];
  }

  return { ...(produto as Produto), relacionados };
}

export async function listarLogs(filtros?: {
  produtoId?: string;
  autorEmail?: string;
}): Promise<Log[]> {
  const supabase = await criarClienteServidor();

  let consulta = supabase
    .from("produto_logs")
    .select("*")
    .order("criado_em", { ascending: false })
    .limit(500);

  if (filtros?.produtoId) consulta = consulta.eq("produto_id", filtros.produtoId);
  if (filtros?.autorEmail) consulta = consulta.eq("autor_email", filtros.autorEmail);

  const { data, error } = await consulta;
  if (error) throw new Error(error.message);
  return (data ?? []) as Log[];
}

export async function listarLogsDoProduto(produtoId: string): Promise<Log[]> {
  return listarLogs({ produtoId });
}

/** Lista de pessoas que já alteraram alguma coisa, para o filtro da tela de logs. */
export async function listarAutores(): Promise<{ nome: string; email: string }[]> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("produto_logs")
    .select("autor_nome, autor_email")
    .order("autor_nome", { ascending: true })
    .limit(1000);

  const mapa = new Map<string, string>();
  (data ?? []).forEach((linha) => mapa.set(linha.autor_email, linha.autor_nome));
  return [...mapa.entries()]
    .map(([email, nome]) => ({ email, nome }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}
