export type Categoria =
  | "Formação"
  | "Membership"
  | "Sprint"
  | "Pós"
  | "Stack"
  | "Curso"
  | "Evento"
  | "In-Company"
  | "Outro";

export type Status = "Ativo" | "Em lançamento" | "Pausado" | "Descontinuado";

export type Patrocinador = { nome: string; edicoes: string };
export type LinkUtil = { label: string; url: string };

/** Uma linha da tabela public.produtos. */
export type Produto = {
  id: string;
  slug: string;

  nome_oficial: string;
  nome_curto: string;
  categoria: Categoria;
  status: Status;
  time_responsavel: string;
  nome_responsavel: string;

  resumo: string;
  proposta_valor: string;
  publico_alvo: string;
  carga_horaria: string;
  tempo_acesso: string;
  dores: string[];
  diferenciais: string[];
  modulos: string[];
  link_site: string;
  link_lp: string;
  pdf_nome: string;
  pdf_path: string;

  observacoes_lancamento: string;
  revisado_por: string;
  data_revisao: string | null;

  // Só preenchidos quando categoria === "Evento".
  evento_palestrantes: number | null;
  evento_palcos: number | null;
  evento_participantes: string | null;
  evento_local: string | null;
  evento_trilhas: string[];
  evento_historico: string | null;
  evento_nomes_palcos: string[];
  evento_patrocinadores: Patrocinador[];
  evento_links_uteis: LinkUtil[];

  criado_em: string;
  atualizado_em: string;
  criado_por_nome: string;
  criado_por_email: string;
  atualizado_por_nome: string;
  atualizado_por_email: string;
};

/** Versão enxuta usada em listas e no seletor de produtos relacionados. */
export type ProdutoResumo = Pick<
  Produto,
  "id" | "slug" | "nome_oficial" | "nome_curto" | "categoria" | "status"
>;

export type ProdutoComRelacionados = Produto & { relacionados: ProdutoResumo[] };

export type Log = {
  id: number;
  produto_id: string | null;
  produto_nome: string;
  campo: string;
  resumo: string;
  autor_nome: string;
  autor_email: string;
  criado_em: string;
};

export type Perfil = {
  id: string;
  email: string;
  nome: string;
};

/** O que o formulário de cadastro/edição envia para o servidor. */
export type DadosProduto = {
  nome_oficial: string;
  nome_curto: string;
  categoria: Categoria | "";
  status: Status | "";
  time_responsavel: string;
  nome_responsavel: string;

  resumo: string;
  proposta_valor: string;
  publico_alvo: string;
  carga_horaria: string;
  tempo_acesso: string;
  dores: string[];
  diferenciais: string[];
  modulos: string[];
  relacionados: string[]; // ids de outros produtos
  link_site: string;
  link_lp: string;
  pdf_nome: string;
  pdf_path: string;

  observacoes_lancamento: string;

  evento_palestrantes: string;
  evento_palcos: string;
  evento_participantes: string;
  evento_local: string;
  evento_trilhas: string[];
  evento_historico: string;
  evento_nomes_palcos: string[];
  evento_patrocinadores: Patrocinador[];
  evento_links_uteis: LinkUtil[];
};

/** Resposta padrão das server actions. */
export type Resultado =
  | { ok: true; slug?: string; mensagem?: string }
  | { ok: false; erro: string };
