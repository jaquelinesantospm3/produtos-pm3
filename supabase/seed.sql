-- =====================================================================
-- PRODUTOS PM3 — produtos de exemplo (os mesmos do protótipo)
-- Rode DEPOIS do supabase/schema.sql, no SQL Editor do Supabase.
-- Pode rodar mais de uma vez: ele apaga e recria só estes 5 produtos.
-- =====================================================================

begin;

-- Apaga a versão anterior destes exemplos (leva junto logs e vínculos).
delete from public.produtos
where slug in ('ai-product-leader','formacao-gestao-produto','sprint-discovery-ia','pos-tech-produto','pm3-on-stage');

-- Durante a carga inicial desligamos os gatilhos, para gravar as datas e
-- os autores históricos exatamente como estavam no protótipo. Os logs
-- desse período são inseridos à mão logo abaixo. A partir daí tudo volta
-- a ser automático.
alter table public.produtos disable trigger trg_carimbar_produto;
alter table public.produtos disable trigger trg_log_produto;
alter table public.produto_relacionados disable trigger trg_log_relacionados;

insert into public.produtos (
  slug, nome_oficial, nome_curto, categoria, status, time_responsavel, nome_responsavel,
  resumo, proposta_valor, publico_alvo, carga_horaria, tempo_acesso,
  dores, diferenciais, modulos, link_site, link_lp, pdf_nome,
  observacoes_lancamento, revisado_por, data_revisao,
  evento_palestrantes, evento_palcos, evento_participantes, evento_local,
  evento_trilhas, evento_historico, evento_nomes_palcos,
  evento_patrocinadores, evento_links_uteis,
  criado_em, atualizado_em, criado_por_nome, criado_por_email, atualizado_por_nome, atualizado_por_email
) values
(
  'ai-product-leader',
  'AI Product Leader',
  'AI Product Leader',
  'Curso',
  'Ativo',
  'Time Cursos',
  'Camila Farinazzo',
  'Curso para líderes de produto que precisam decidir onde e como usar IA de forma responsável, sem depender de achismo técnico.',
  'Ensina o raciocínio por trás das decisões de produto com IA — não apenas ferramentas, mas como avaliar viabilidade, risco e valor antes de priorizar qualquer iniciativa de IA no roadmap.',
  'PMs, líderes de produto e gestores que precisam tomar decisões sobre IA no produto, mesmo sem background técnico profundo.',
  '12h',
  '12 meses',
  array[
    'Time de produto pressionado a ''colocar IA'' sem critério claro de priorização',
    'Dificuldade em avaliar viabilidade técnica de uma ideia com IA antes de comprometer o roadmap',
    'Falta de vocabulário comum entre produto e engenharia para discutir IA'
  ],
  array[
    'Foco em decisão de produto, não em codar modelos',
    'Estudos de caso reais de squads que erraram a priorização',
    'Entregável prático: um framework de avaliação aplicado ao produto do aluno'
  ],
  array[
    'Aula 1 — Onde a IA cria valor real em produto (e onde não cria)',
    'Aula 2 — Avaliando viabilidade técnica sem ser técnico',
    'Aula 3 — Priorização de iniciativas de IA no roadmap',
    'Aula 4 — Riscos, vieses e limites éticos na prática',
    'Aula 5 — Métricas de sucesso para produtos com IA',
    'Aula 6 — Estudo de caso final e entregável'
  ],
  'https://pm3.com.br/ai-product-leader',
  'https://pm3.com.br/lp/ai-product-leader',
  'ai-product-leader-ementa.pdf',
  'Turma piloto com boa retenção. Próxima turma com ajuste na aula 4 após feedback.',
  'Camila Farinazzo',
  date '2026-08-20',
  null, null, null, null, '{}', null, '{}', '[]'::jsonb, '[]'::jsonb,
  timestamptz '2025-11-02 09:00-03', timestamptz '2026-08-20 15:30-03',
  'Camila Farinazzo', 'camila.farinazzo@pm3.com.br',
  'Camila Farinazzo', 'camila.farinazzo@pm3.com.br'
),
(
  'formacao-gestao-produto',
  'Formação em Gestão de Produto',
  'Formação PM',
  'Formação',
  'Ativo',
  'Time Cursos',
  'Rodrigo Alves',
  'Formação completa para quem está migrando de carreira para produto ou quer estruturar a base que nunca teve.',
  'Do zero à primeira entrega como PM: discovery, delivery, métricas e stakeholders, com mentoria em grupo ao longo do programa.',
  'Profissionais em transição de carreira para produto, ou PMs juniores sem formação estruturada.',
  '80h',
  '18 meses',
  array[
    'Aprendeu produto ''na prática'', sem base teórica sólida',
    'Insegurança para conduzir discovery e priorização com confiança',
    'Dificuldade em conseguir a primeira vaga como PM'
  ],
  array[
    'Mentoria em grupo quinzenal com PMs seniores',
    'Portfólio de projetos reais ao final da formação',
    'Comunidade ativa de alunos e ex-alunos'
  ],
  array[
    'Módulo 1 — Fundamentos de gestão de produto',
    'Módulo 2 — Discovery e pesquisa com usuários',
    'Módulo 3 — Priorização e roadmap',
    'Módulo 4 — Delivery e trabalho com times técnicos',
    'Módulo 5 — Métricas e experimentação',
    'Módulo 6 — Projeto final de portfólio'
  ],
  'https://pm3.com.br/formacao-pm',
  'https://pm3.com.br/lp/formacao-pm',
  'formacao-pm-ementa.pdf',
  'Turma recorrente, sem alterações estruturais nos últimos 2 ciclos.',
  'Rodrigo Alves',
  date '2026-04-02',
  null, null, null, null, '{}', null, '{}', '[]'::jsonb, '[]'::jsonb,
  timestamptz '2025-03-14 10:00-03', timestamptz '2026-04-02 11:00-03',
  'Rodrigo Alves', 'rodrigo.alves@pm3.com.br',
  'Rodrigo Alves', 'rodrigo.alves@pm3.com.br'
),
(
  'sprint-discovery-ia',
  'Sprint de Discovery com IA',
  'Sprint Discovery IA',
  'Sprint',
  'Em lançamento',
  'Time Campanhas',
  'Bianca Teodoro',
  'Sprint intensiva de 3 dias para times de produto testarem hipóteses de IA com usuários reais antes de investir em desenvolvimento.',
  'Sai da sprint com uma hipótese validada (ou descartada) e um protótipo testável, sem escrever uma linha de código de produção.',
  'Squads de produto que querem validar uma hipótese de IA rapidamente, antes de comprometer sprint de engenharia.',
  '24h (3 dias)',
  'Acesso vitalício aos materiais e templates',
  array[
    'Times que investem meses num MVP de IA que o usuário não queria',
    'Falta de método rápido para testar hipóteses antes do build'
  ],
  array[
    'Formato intensivo presencial, com facilitação PM3',
    'Uso de protótipos low-fi para simular a IA antes de construir de verdade'
  ],
  array[
    'Dia 1 — Mapeamento da hipótese e do usuário',
    'Dia 2 — Construção do protótipo simulado',
    'Dia 3 — Teste com usuários e leitura de resultado'
  ],
  'https://pm3.com.br/sprint-discovery-ia',
  '',
  '',
  'Primeira turma prevista para outubro/2026. Página de vendas ainda em construção.',
  'Bianca Teodoro',
  date '2026-07-10',
  null, null, null, null, '{}', null, '{}', '[]'::jsonb, '[]'::jsonb,
  timestamptz '2026-07-10 14:00-03', timestamptz '2026-07-10 14:00-03',
  'Bianca Teodoro', 'bianca.teodoro@pm3.com.br',
  'Bianca Teodoro', 'bianca.teodoro@pm3.com.br'
),
(
  'pos-tech-produto',
  'Pós-Tech em Gestão de Produtos Digitais',
  'Pós-Tech Produto',
  'Pós',
  'Pausado',
  'Time Cursos',
  'Camila Farinazzo',
  'Pós-graduação lato sensu em parceria acadêmica, com certificado reconhecido pelo MEC.',
  'Combina rigor acadêmico com estudos de caso do mercado real, certificado por instituição parceira.',
  'Profissionais de produto que precisam de certificação formal para progressão de carreira.',
  '360h',
  '24 meses',
  array['Empresas que exigem certificação formal (lato sensu) para promoção'],
  array['Certificado reconhecido pelo MEC via instituição parceira'],
  array[
    'Bloco 1 — Fundamentos de gestão e estratégia de produto',
    'Bloco 2 — Métodos ágeis e discovery',
    'Bloco 3 — Dados e experimentação',
    'Bloco 4 — Trabalho de conclusão'
  ],
  'https://pm3.com.br/pos-tech-produto',
  'https://pm3.com.br/lp/pos-tech-produto',
  'pos-tech-produto-ementa.pdf',
  'Pausado por revisão de parceria acadêmica. Retorno previsto para 2027.',
  'Camila Farinazzo',
  date '2025-12-11',
  null, null, null, null, '{}', null, '{}', '[]'::jsonb, '[]'::jsonb,
  timestamptz '2024-08-01 09:00-03', timestamptz '2025-12-11 16:00-03',
  'Camila Farinazzo', 'camila.farinazzo@pm3.com.br',
  'Camila Farinazzo', 'camila.farinazzo@pm3.com.br'
),
(
  'pm3-on-stage',
  'PM3 On Stage',
  'PM3 On Stage',
  'Evento',
  'Ativo',
  'Time Eventos',
  'Bianca Teodoro',
  'O maior encontro de gestão de produto do Brasil, reunindo lideranças de produto, cases de mercado e comunidade em um único dia.',
  'Um dia inteiro de conteúdo prático direto de quem constrói produto no Brasil, sem enrolação institucional.',
  'PMs, líderes de produto, founders e squads inteiros que querem se atualizar e fazer networking com o mercado.',
  '8h (1 dia)',
  'Acesso às gravações por 6 meses após o evento',
  array[
    'Dificuldade de acompanhar o que há de mais atual em produto no Brasil',
    'Falta de networking real com outros líderes de produto'
  ],
  array[
    'Curadoria de palestrantes que constroem produto de verdade, não só palestram',
    'Trilhas paralelas para públicos diferentes no mesmo evento'
  ],
  array[
    'Manhã — Abertura e trilha principal com cases de mercado',
    'Tarde — Trilhas paralelas por tema',
    'Encerramento — Painel com palestrantes e networking'
  ],
  'https://pm3.com.br/on-stage',
  'https://pm3.com.br/lp/on-stage',
  'pm3-on-stage-apresentacao.pdf',
  'Edição 2026 confirmada para novembro. Negociação de mais 2 patrocinadores em andamento.',
  'Bianca Teodoro',
  date '2026-08-05',
  -- campos exclusivos de Evento
  24,
  3,
  '1.200',
  'Transamerica Expo Center, São Paulo — SP',
  array['Discovery','IA em Produto','Liderança','Growth','Dados'],
  'Realizado anualmente desde 2019. Começou como um meetup de 150 pessoas e hoje é o maior evento de produto do país, com edições em São Paulo e uma edição especial online durante 2021.',
  array['Marty Cagan','Camila Farinazzo','Teresa Torres','Rodrigo Alves'],
  '[{"nome":"Empresa Alpha","edicoes":"2023, 2024, 2025"},
    {"nome":"Empresa Beta","edicoes":"2024, 2025"},
    {"nome":"Empresa Gama","edicoes":"2025"}]'::jsonb,
  '[{"label":"Regulamento do evento","url":"https://pm3.com.br/on-stage/regulamento"},
    {"label":"Kit de imprensa","url":"https://pm3.com.br/on-stage/imprensa"},
    {"label":"Fotos da edição anterior","url":"https://pm3.com.br/on-stage/2025/fotos"}]'::jsonb,
  timestamptz '2025-01-20 09:00-03', timestamptz '2026-08-05 17:00-03',
  'Bianca Teodoro', 'bianca.teodoro@pm3.com.br',
  'Bianca Teodoro', 'bianca.teodoro@pm3.com.br'
);

-- Produtos relacionados (mesmos vínculos do protótipo).
insert into public.produto_relacionados (produto_id, relacionado_id)
select p.id, r.id
from (values
  ('ai-product-leader',       'sprint-discovery-ia'),
  ('ai-product-leader',       'pos-tech-produto'),
  ('formacao-gestao-produto', 'ai-product-leader'),
  ('sprint-discovery-ia',     'ai-product-leader'),
  ('pos-tech-produto',        'ai-product-leader'),
  ('pm3-on-stage',            'ai-product-leader')
) as v(origem, destino)
join public.produtos p on p.slug = v.origem
join public.produtos r on r.slug = v.destino;

-- Histórico que já existia no protótipo.
insert into public.produto_logs (produto_id, produto_nome, campo, resumo, autor_nome, autor_email, criado_em)
select p.id, p.nome_oficial, v.campo, v.resumo, v.autor_nome, v.autor_email, v.criado_em
from (values
  ('ai-product-leader',       'Observações de lançamento', 'Atualizou observações após feedback da turma piloto.',        'Camila Farinazzo', 'camila.farinazzo@pm3.com.br', timestamptz '2026-08-20 15:30-03'),
  ('ai-product-leader',       'Módulos',                   'Reordenou aula 4 e 5 conforme feedback de turma.',            'Camila Farinazzo', 'camila.farinazzo@pm3.com.br', timestamptz '2026-06-02 10:15-03'),
  ('sprint-discovery-ia',     'Cadastro',                  'Produto cadastrado pela primeira vez.',                       'Bianca Teodoro',   'bianca.teodoro@pm3.com.br',   timestamptz '2026-07-10 14:00-03'),
  ('pos-tech-produto',        'Status',                    'Alterado de Ativo para Pausado (revisão de parceria).',       'Camila Farinazzo', 'camila.farinazzo@pm3.com.br', timestamptz '2025-12-11 16:00-03'),
  ('formacao-gestao-produto', 'Carga horária',             'Corrigido de 72h para 80h.',                                  'Rodrigo Alves',    'rodrigo.alves@pm3.com.br',    timestamptz '2026-04-02 11:00-03'),
  ('pm3-on-stage',            'Patrocinadores',            'Adicionada Empresa Gama como patrocinadora da edição 2025.',  'Bianca Teodoro',   'bianca.teodoro@pm3.com.br',   timestamptz '2026-08-05 17:00-03')
) as v(slug, campo, resumo, autor_nome, autor_email, criado_em)
join public.produtos p on p.slug = v.slug;

alter table public.produtos enable trigger trg_carimbar_produto;
alter table public.produtos enable trigger trg_log_produto;
alter table public.produto_relacionados enable trigger trg_log_relacionados;

commit;
