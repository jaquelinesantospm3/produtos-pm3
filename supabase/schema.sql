-- =====================================================================
-- PRODUTOS PM3 — estrutura do banco de dados
-- Rode este arquivo INTEIRO no SQL Editor do Supabase (uma vez só).
-- Depois rode o supabase/seed.sql para popular com os produtos de exemplo.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. REGRA DE ACESSO: só e-mails @pm3.com.br
--    Validada aqui no banco, não só na tela de login.
-- ---------------------------------------------------------------------
create or replace function public.eh_email_pm3(email text)
returns boolean
language sql
immutable
as $$
  select lower(coalesce(email, '')) like '%@pm3.com.br';
$$;

-- Usa o e-mail de quem está logado (vem do token de autenticação).
create or replace function public.usuario_eh_pm3()
returns boolean
language sql
stable
as $$
  select public.eh_email_pm3(auth.jwt() ->> 'email');
$$;

-- Barra a criação de qualquer conta fora do domínio, mesmo que alguém
-- chame a API do Supabase direto, sem passar pela nossa tela de login.
create or replace function public.bloquear_dominio_externo()
returns trigger
language plpgsql
security definer
as $$
begin
  if not public.eh_email_pm3(new.email) then
    raise exception 'Acesso restrito a e-mails @pm3.com.br';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_bloquear_dominio_externo on auth.users;
create trigger trg_bloquear_dominio_externo
  before insert on auth.users
  for each row execute function public.bloquear_dominio_externo();

-- ---------------------------------------------------------------------
-- 2. PERFIS — nome e e-mail de quem usa o sistema.
--    Criado automaticamente no primeiro login (magic link não pede nome),
--    com o nome deduzido do e-mail. A pessoa ajusta depois em /perfil.
-- ---------------------------------------------------------------------
create table if not exists public.perfis (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null unique,
  nome          text not null,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create or replace function public.nome_a_partir_do_email(email text)
returns text
language sql
immutable
as $$
  select initcap(replace(replace(split_part(email, '@', 1), '.', ' '), '_', ' '));
$$;

create or replace function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.perfis (id, email, nome)
  values (
    new.id,
    lower(new.email),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      public.nome_a_partir_do_email(new.email)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_criar_perfil on auth.users;
create trigger trg_criar_perfil
  after insert on auth.users
  for each row execute function public.criar_perfil_novo_usuario();

-- ---------------------------------------------------------------------
-- 3. PRODUTOS
--    Campos comuns a todas as categorias + campos que só existem quando
--    a categoria é "Evento" (prefixados com evento_ e nulos nas demais).
--    Colunas na mesma tabela em vez de uma tabela 1:1 à parte: a relação
--    seria sempre 1 para 1, e assim o one pager sai numa consulta só.
-- ---------------------------------------------------------------------
create table if not exists public.produtos (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,

  -- Identificação e governança (tela 1 do cadastro)
  nome_oficial      text not null,
  nome_curto        text not null default '',
  categoria         text not null
    check (categoria in ('Formação','Membership','Sprint','Pós','Stack','Curso','Evento','In-Company','Outro')),
  status            text not null default 'Em lançamento'
    check (status in ('Ativo','Em lançamento','Pausado','Descontinuado')),
  time_responsavel  text not null default '',
  nome_responsavel  text not null default '',

  -- Informações do produto (tela 2 do cadastro)
  resumo         text not null default '',
  proposta_valor text not null default '',
  publico_alvo   text not null default '',
  carga_horaria  text not null default '',
  tempo_acesso   text not null default '',
  dores          text[] not null default '{}',
  diferenciais   text[] not null default '{}',
  modulos        text[] not null default '{}',
  link_site      text not null default '',
  link_lp        text not null default '',
  pdf_nome       text not null default '',   -- nome original do arquivo
  pdf_path       text not null default '',   -- caminho dentro do bucket de storage

  -- Status e observações (tela 3 do cadastro)
  observacoes_lancamento text not null default '',
  revisado_por           text not null default '',
  data_revisao           date,

  -- ---- CAMPOS EXCLUSIVOS DA CATEGORIA "EVENTO" ----------------------
  -- Ficam nulos/vazios em qualquer outra categoria; a aplicação só os
  -- mostra (e só deixa preencher) quando categoria = 'Evento'.
  evento_palestrantes    integer,
  evento_palcos          integer,
  evento_participantes   text,       -- texto, para aceitar "1.200"
  evento_local           text,
  evento_trilhas         text[] not null default '{}',
  evento_historico       text,
  evento_nomes_palcos    text[] not null default '{}',
  -- listas ordenadas de registros simples, sempre editadas por inteiro
  evento_patrocinadores  jsonb not null default '[]'::jsonb,  -- [{nome, edicoes}]
  evento_links_uteis     jsonb not null default '[]'::jsonb,  -- [{label, url}]

  -- Datas e assinatura, preenchidas pelo sistema (ver gatilhos abaixo)
  criado_em             timestamptz not null default now(),
  atualizado_em         timestamptz not null default now(),
  criado_por_email      text not null default '',
  criado_por_nome       text not null default '',
  atualizado_por_email  text not null default '',
  atualizado_por_nome   text not null default ''
);

create index if not exists idx_produtos_categoria on public.produtos (categoria);
create index if not exists idx_produtos_status    on public.produtos (status);

-- Relação real entre produtos (não texto livre).
create table if not exists public.produto_relacionados (
  produto_id     uuid not null references public.produtos(id) on delete cascade,
  relacionado_id uuid not null references public.produtos(id) on delete cascade,
  primary key (produto_id, relacionado_id),
  constraint nao_relaciona_consigo_mesmo check (produto_id <> relacionado_id)
);

create index if not exists idx_relacionados_produto on public.produto_relacionados (produto_id);

-- ---------------------------------------------------------------------
-- 4. LOGS DE ALTERAÇÃO
--    Gerados por gatilho no banco: qualquer alteração vira registro,
--    inclusive as feitas fora da aplicação.
-- ---------------------------------------------------------------------
create table if not exists public.produto_logs (
  id           bigserial primary key,
  produto_id   uuid references public.produtos(id) on delete cascade,
  produto_nome text not null,
  campo        text not null,
  resumo       text not null,
  autor_nome   text not null,
  autor_email  text not null,
  criado_em    timestamptz not null default now()
);

create index if not exists idx_logs_produto on public.produto_logs (produto_id);
create index if not exists idx_logs_data    on public.produto_logs (criado_em desc);

-- Nome legível de cada campo, para o log não mostrar nome de coluna.
create or replace function public.rotulo_campo(campo text)
returns text
language sql
immutable
as $$
  select coalesce(
    (jsonb_build_object(
      'nome_oficial','Nome oficial',
      'nome_curto','Nome curto',
      'categoria','Categoria',
      'status','Status',
      'time_responsavel','Time responsável',
      'nome_responsavel','Nome do responsável',
      'resumo','Resumo',
      'proposta_valor','Proposta de valor',
      'publico_alvo','Público-alvo',
      'carga_horaria','Carga horária',
      'tempo_acesso','Tempo de acesso',
      'dores','Dores',
      'diferenciais','Diferenciais',
      'modulos','Módulos',
      'link_site','Link do site',
      'link_lp','Link da landing page',
      'pdf_nome','PDF do produto',
      'pdf_path','PDF do produto',
      'observacoes_lancamento','Observações de lançamento',
      'revisado_por','Revisado por',
      'data_revisao','Data de revisão',
      'evento_palestrantes','Palestrantes',
      'evento_palcos','Palcos',
      'evento_participantes','Participantes',
      'evento_local','Local do evento',
      'evento_trilhas','Trilhas de conhecimento',
      'evento_historico','Histórico do evento',
      'evento_nomes_palcos','Nomes que já passaram pelos palcos',
      'evento_patrocinadores','Patrocinadores',
      'evento_links_uteis','Links úteis'
    ) ->> campo),
    campo
  );
$$;

-- Frase curta descrevendo a mudança, em português.
create or replace function public.resumo_mudanca(campo text, valor_antigo jsonb, valor_novo jsonb)
returns text
language plpgsql
immutable
as $$
declare
  antigo text;
  novo   text;
begin
  if jsonb_typeof(valor_novo) = 'array' then
    return format('Lista atualizada (de %s para %s itens).',
      coalesce(jsonb_array_length(valor_antigo), 0),
      coalesce(jsonb_array_length(valor_novo), 0));
  end if;

  antigo := coalesce(nullif(valor_antigo #>> '{}', ''), '(vazio)');
  novo   := coalesce(nullif(valor_novo   #>> '{}', ''), '(vazio)');

  if length(antigo) > 60 or length(novo) > 60 then
    return format('Texto de "%s" atualizado.', public.rotulo_campo(campo));
  end if;

  return format('Alterado de "%s" para "%s".', antigo, novo);
end;
$$;

-- Quem está fazendo a alteração: nome e e-mail vêm do login, nunca digitados.
create or replace function public.autor_atual(out nome text, out email text)
language plpgsql
stable
as $$
begin
  email := coalesce(auth.jwt() ->> 'email', '');
  select p.nome into nome from public.perfis p where p.id = auth.uid();
  if nome is null then
    nome := case when email = '' then 'Sistema' else public.nome_a_partir_do_email(email) end;
  end if;
  if email = '' then
    email := 'sistema@pm3.com.br';
  end if;
end;
$$;

create or replace function public.registrar_log_produto()
returns trigger
language plpgsql
security definer
as $$
declare
  autor     record;
  antigo    jsonb;
  novo      jsonb;
  chave     text;
  ignorados text[] := array[
    'id','slug','criado_em','atualizado_em',
    'criado_por_email','criado_por_nome',
    'atualizado_por_email','atualizado_por_nome'
  ];
begin
  select * into autor from public.autor_atual();

  if tg_op = 'INSERT' then
    insert into public.produto_logs (produto_id, produto_nome, campo, resumo, autor_nome, autor_email)
    values (new.id, new.nome_oficial, 'Cadastro',
            'Produto cadastrado pela primeira vez.', autor.nome, autor.email);
    return new;
  end if;

  antigo := to_jsonb(old);
  novo   := to_jsonb(new);

  for chave in select jsonb_object_keys(novo) loop
    if chave = any (ignorados) then
      continue;
    end if;
    if (antigo -> chave) is distinct from (novo -> chave) then
      insert into public.produto_logs (produto_id, produto_nome, campo, resumo, autor_nome, autor_email)
      values (
        new.id,
        new.nome_oficial,
        public.rotulo_campo(chave),
        public.resumo_mudanca(chave, antigo -> chave, novo -> chave),
        autor.nome,
        autor.email
      );
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists trg_log_produto on public.produtos;
create trigger trg_log_produto
  after insert or update on public.produtos
  for each row execute function public.registrar_log_produto();

-- Datas e assinatura preenchidas pelo sistema, nunca pelo formulário.
create or replace function public.carimbar_produto()
returns trigger
language plpgsql
security definer
as $$
declare
  autor record;
begin
  select * into autor from public.autor_atual();

  if tg_op = 'INSERT' then
    new.criado_em        := now();
    new.criado_por_email := autor.email;
    new.criado_por_nome  := autor.nome;
  else
    new.criado_em        := old.criado_em;
    new.criado_por_email := old.criado_por_email;
    new.criado_por_nome  := old.criado_por_nome;
  end if;

  new.atualizado_em        := now();
  new.atualizado_por_email := autor.email;
  new.atualizado_por_nome  := autor.nome;
  return new;
end;
$$;

drop trigger if exists trg_carimbar_produto on public.produtos;
create trigger trg_carimbar_produto
  before insert or update on public.produtos
  for each row execute function public.carimbar_produto();

-- Alterações nos produtos relacionados também viram log.
create or replace function public.registrar_log_relacionados()
returns trigger
language plpgsql
security definer
as $$
declare
  autor    record;
  alvo     uuid;
  nome_p   text;
  nome_rel text;
begin
  select * into autor from public.autor_atual();
  alvo := coalesce(new.produto_id, old.produto_id);

  select nome_oficial into nome_p from public.produtos where id = alvo;
  select coalesce(nullif(nome_curto, ''), nome_oficial) into nome_rel from public.produtos
    where id = coalesce(new.relacionado_id, old.relacionado_id);

  insert into public.produto_logs (produto_id, produto_nome, campo, resumo, autor_nome, autor_email)
  values (
    alvo,
    coalesce(nome_p, 'Produto removido'),
    'Produtos relacionados',
    case when tg_op = 'INSERT'
      then format('Vinculado ao produto "%s".', coalesce(nome_rel, '?'))
      else format('Removido o vínculo com "%s".', coalesce(nome_rel, '?'))
    end,
    autor.nome,
    autor.email
  );
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_log_relacionados on public.produto_relacionados;
create trigger trg_log_relacionados
  after insert or delete on public.produto_relacionados
  for each row execute function public.registrar_log_relacionados();

-- ---------------------------------------------------------------------
-- 5. SEGURANÇA DE LINHA (RLS)
--    Qualquer pessoa logada com @pm3.com.br vê e edita tudo.
--    Quem não for @pm3.com.br não enxerga uma linha sequer.
-- ---------------------------------------------------------------------
alter table public.perfis               enable row level security;
alter table public.produtos             enable row level security;
alter table public.produto_relacionados enable row level security;
alter table public.produto_logs         enable row level security;

drop policy if exists "perfis: pm3 le"      on public.perfis;
drop policy if exists "perfis: edita o seu" on public.perfis;
create policy "perfis: pm3 le"      on public.perfis for select using (public.usuario_eh_pm3());
create policy "perfis: edita o seu" on public.perfis for update
  using (id = auth.uid() and public.usuario_eh_pm3())
  with check (id = auth.uid() and public.usuario_eh_pm3());

drop policy if exists "produtos: pm3 le"    on public.produtos;
drop policy if exists "produtos: pm3 cria"  on public.produtos;
drop policy if exists "produtos: pm3 edita" on public.produtos;
drop policy if exists "produtos: pm3 apaga" on public.produtos;
create policy "produtos: pm3 le"    on public.produtos for select using (public.usuario_eh_pm3());
create policy "produtos: pm3 cria"  on public.produtos for insert with check (public.usuario_eh_pm3());
create policy "produtos: pm3 edita" on public.produtos for update
  using (public.usuario_eh_pm3()) with check (public.usuario_eh_pm3());
create policy "produtos: pm3 apaga" on public.produtos for delete using (public.usuario_eh_pm3());

drop policy if exists "relacionados: pm3 le"    on public.produto_relacionados;
drop policy if exists "relacionados: pm3 cria"  on public.produto_relacionados;
drop policy if exists "relacionados: pm3 apaga" on public.produto_relacionados;
create policy "relacionados: pm3 le"    on public.produto_relacionados for select using (public.usuario_eh_pm3());
create policy "relacionados: pm3 cria"  on public.produto_relacionados for insert with check (public.usuario_eh_pm3());
create policy "relacionados: pm3 apaga" on public.produto_relacionados for delete using (public.usuario_eh_pm3());

-- Logs são só de leitura para a aplicação: quem escreve neles é o gatilho.
drop policy if exists "logs: pm3 le" on public.produto_logs;
create policy "logs: pm3 le" on public.produto_logs for select using (public.usuario_eh_pm3());

-- ---------------------------------------------------------------------
-- 6. STORAGE — bucket privado para os PDFs dos produtos
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('produtos-pdf', 'produtos-pdf', false)
on conflict (id) do nothing;

drop policy if exists "pdf: pm3 le"    on storage.objects;
drop policy if exists "pdf: pm3 envia" on storage.objects;
drop policy if exists "pdf: pm3 troca" on storage.objects;
drop policy if exists "pdf: pm3 apaga" on storage.objects;
create policy "pdf: pm3 le" on storage.objects for select
  using (bucket_id = 'produtos-pdf' and public.usuario_eh_pm3());
create policy "pdf: pm3 envia" on storage.objects for insert
  with check (bucket_id = 'produtos-pdf' and public.usuario_eh_pm3());
create policy "pdf: pm3 troca" on storage.objects for update
  using (bucket_id = 'produtos-pdf' and public.usuario_eh_pm3());
create policy "pdf: pm3 apaga" on storage.objects for delete
  using (bucket_id = 'produtos-pdf' and public.usuario_eh_pm3());
