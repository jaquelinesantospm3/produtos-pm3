-- =====================================================================
-- PRODUTOS PM3 — banco de dados (Cloudflare D1 / SQLite)
--
-- Rode com:
--   npx wrangler d1 migrations apply produtos-pm3 --local     (na sua máquina)
--   npx wrangler d1 migrations apply produtos-pm3 --remote    (em produção)
--
-- Diferenças em relação ao banco antigo, de propósito:
--
-- 1. Não existe tabela de usuários nem controle de acesso aqui dentro.
--    Quem pode entrar é decidido pelo Cloudflare Access, na porta de
--    entrada, antes da requisição chegar ao Worker. O nome e o e-mail de
--    quem fez cada alteração chegam prontos no cabeçalho da requisição.
--
-- 2. Listas (dores, diferenciais, módulos...) e objetos (patrocinadores,
--    links úteis) ficam guardados como texto em formato JSON. O SQLite não
--    tem coluna de lista; a aplicação converte na leitura e na escrita.
--
-- 3. Os logs de alteração são gravados pela aplicação, não por gatilho de
--    banco. Toda escrita passa por src/actions/produtos.ts.
-- =====================================================================

-- ---------------------------------------------------------------------
-- PRODUTOS
-- ---------------------------------------------------------------------
create table if not exists produtos (
  id            text primary key,
  slug          text not null unique,

  -- Identificação
  nome_oficial      text not null,
  nome_curto        text not null default '',
  categoria         text not null
    check (categoria in ('Formação','Membership','Sprint','Pós','Stack','Curso','Evento','In-Company','Outro')),
  status            text not null default 'Em lançamento'
    check (status in ('Ativo','Em lançamento','Pausado','Descontinuado')),
  time_responsavel  text not null default '',
  nome_responsavel  text not null default '',

  -- Conteúdo do one-pager
  resumo         text not null default '',
  proposta_valor text not null default '',
  publico_alvo   text not null default '',
  carga_horaria  text not null default '',
  tempo_acesso   text not null default '',
  dores          text not null default '[]',   -- JSON: lista de textos
  diferenciais   text not null default '[]',   -- JSON: lista de textos
  modulos        text not null default '[]',   -- JSON: lista de textos
  link_site      text not null default '',
  link_lp        text not null default '',
  pdf_nome       text not null default '',     -- nome original do arquivo
  pdf_path       text not null default '',     -- caminho do objeto no bucket R2

  -- Governança
  observacoes_lancamento text not null default '',
  revisado_por           text not null default '',
  data_revisao           text,                 -- AAAA-MM-DD

  -- Campos exclusivos de evento
  evento_palestrantes    integer,
  evento_palcos          integer,
  evento_participantes   text,                 -- texto, para aceitar "1.200"
  evento_local           text,
  evento_trilhas         text not null default '[]',   -- JSON: lista de textos
  evento_historico       text,
  evento_nomes_palcos    text not null default '[]',   -- JSON: lista de textos
  evento_patrocinadores  text not null default '[]',   -- JSON: [{nome, edicoes}]
  evento_links_uteis     text not null default '[]',   -- JSON: [{label, url}]

  -- Carimbo automático (preenchido pela aplicação, nunca pelo formulário)
  criado_em             text not null,
  atualizado_em         text not null,
  criado_por_email      text not null default '',
  criado_por_nome       text not null default '',
  atualizado_por_email  text not null default '',
  atualizado_por_nome   text not null default ''
);

create index if not exists idx_produtos_nome      on produtos (nome_oficial);
create index if not exists idx_produtos_categoria on produtos (categoria);
create index if not exists idx_produtos_status    on produtos (status);

-- ---------------------------------------------------------------------
-- PRODUTOS RELACIONADOS (vínculo entre dois produtos, sempre nos dois sentidos
-- pela consulta; a linha em si é de mão única)
-- ---------------------------------------------------------------------
create table if not exists produto_relacionados (
  produto_id     text not null references produtos(id) on delete cascade,
  relacionado_id text not null references produtos(id) on delete cascade,
  primary key (produto_id, relacionado_id),
  check (produto_id <> relacionado_id)
);

create index if not exists idx_relacionados_produto on produto_relacionados (produto_id);

-- ---------------------------------------------------------------------
-- LOGS DE ALTERAÇÃO
-- ---------------------------------------------------------------------
create table if not exists produto_logs (
  id           integer primary key autoincrement,
  produto_id   text references produtos(id) on delete cascade,
  produto_nome text not null,
  campo        text not null,
  resumo       text not null,
  autor_nome   text not null,
  autor_email  text not null,
  criado_em    text not null
);

create index if not exists idx_logs_produto on produto_logs (produto_id);
create index if not exists idx_logs_data    on produto_logs (criado_em desc);
