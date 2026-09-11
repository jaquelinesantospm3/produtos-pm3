-- =====================================================================
-- PRODUTOS PM3 — produtos de exemplo (os mesmos do protótipo)
--
-- Rode DEPOIS das migrações, e só se quiser o catálogo já com conteúdo:
--   npx wrangler d1 execute produtos-pm3 --local  --file=./banco/exemplos.sql
--   npx wrangler d1 execute produtos-pm3 --remote --file=./banco/exemplos.sql
--
-- Pode rodar mais de uma vez: apaga e recria só estes 5 produtos.
--
-- Os identificadores abaixo são fixos de propósito, para os vínculos e o
-- histórico apontarem para o produto certo sem precisar de consulta.
-- Produtos criados pela tela recebem identificador sorteado, como sempre.
--
-- Datas gravadas em UTC, que é o formato que a aplicação usa.
-- =====================================================================

delete from produto_logs where produto_id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
  '55555555-5555-4555-8555-555555555555'
);

delete from produto_relacionados where produto_id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
  '55555555-5555-4555-8555-555555555555'
);

delete from produtos where slug in (
  'ai-product-leader',
  'formacao-gestao-produto',
  'sprint-discovery-ia',
  'pos-tech-produto',
  'pm3-on-stage'
);

-- ---------------------------------------------------------------------
-- PRODUTOS
-- ---------------------------------------------------------------------
insert into produtos (
  id, slug, nome_oficial, nome_curto, categoria, status, time_responsavel, nome_responsavel,
  resumo, proposta_valor, publico_alvo, carga_horaria, tempo_acesso,
  dores, diferenciais, modulos, link_site, link_lp, pdf_nome, pdf_path,
  observacoes_lancamento, revisado_por, data_revisao,
  evento_palestrantes, evento_palcos, evento_participantes, evento_local,
  evento_trilhas, evento_historico, evento_nomes_palcos,
  evento_patrocinadores, evento_links_uteis,
  criado_em, atualizado_em, criado_por_nome, criado_por_email, atualizado_por_nome, atualizado_por_email
) values
(
  '11111111-1111-4111-8111-111111111111',
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
  '["Time de produto pressionado a ''colocar IA'' sem critério claro de priorização","Dificuldade em avaliar viabilidade técnica de uma ideia com IA antes de comprometer o roadmap","Falta de vocabulário comum entre produto e engenharia para discutir IA"]',
  '["Foco em decisão de produto, não em codar modelos","Estudos de caso reais de squads que erraram a priorização","Entregável prático: um framework de avaliação aplicado ao produto do aluno"]',
  '["Aula 1 — Onde a IA cria valor real em produto (e onde não cria)","Aula 2 — Avaliando viabilidade técnica sem ser técnico","Aula 3 — Priorização de iniciativas de IA no roadmap","Aula 4 — Riscos, vieses e limites éticos na prática","Aula 5 — Métricas de sucesso para produtos com IA","Aula 6 — Estudo de caso final e entregável"]',
  'https://pm3.com.br/ai-product-leader',
  'https://pm3.com.br/lp/ai-product-leader',
  'ai-product-leader-ementa.pdf',
  '',
  'Turma piloto com boa retenção. Próxima turma com ajuste na aula 4 após feedback.',
  'Camila Farinazzo',
  '2026-08-20',
  null, null, null, null, '[]', null, '[]', '[]', '[]',
  '2025-11-02T12:00:00.000Z', '2026-08-20T18:30:00.000Z',
  'Camila Farinazzo', 'camila.farinazzo@pm3.com.br',
  'Camila Farinazzo', 'camila.farinazzo@pm3.com.br'
),
(
  '22222222-2222-4222-8222-222222222222',
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
  '["Aprendeu produto ''na prática'', sem base teórica sólida","Insegurança para conduzir discovery e priorização com confiança","Dificuldade em conseguir a primeira vaga como PM"]',
  '["Mentoria em grupo quinzenal com PMs seniores","Portfólio de projetos reais ao final da formação","Comunidade ativa de alunos e ex-alunos"]',
  '["Módulo 1 — Fundamentos de gestão de produto","Módulo 2 — Discovery e pesquisa com usuários","Módulo 3 — Priorização e roadmap","Módulo 4 — Delivery e trabalho com times técnicos","Módulo 5 — Métricas e experimentação","Módulo 6 — Projeto final de portfólio"]',
  'https://pm3.com.br/formacao-pm',
  'https://pm3.com.br/lp/formacao-pm',
  'formacao-pm-ementa.pdf',
  '',
  'Turma recorrente, sem alterações estruturais nos últimos 2 ciclos.',
  'Rodrigo Alves',
  '2026-04-02',
  null, null, null, null, '[]', null, '[]', '[]', '[]',
  '2025-03-14T13:00:00.000Z', '2026-04-02T14:00:00.000Z',
  'Rodrigo Alves', 'rodrigo.alves@pm3.com.br',
  'Rodrigo Alves', 'rodrigo.alves@pm3.com.br'
),
(
  '33333333-3333-4333-8333-333333333333',
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
  '["Times que investem meses num MVP de IA que o usuário não queria","Falta de método rápido para testar hipóteses antes do build"]',
  '["Formato intensivo presencial, com facilitação PM3","Uso de protótipos low-fi para simular a IA antes de construir de verdade"]',
  '["Dia 1 — Mapeamento da hipótese e do usuário","Dia 2 — Construção do protótipo simulado","Dia 3 — Teste com usuários e leitura de resultado"]',
  'https://pm3.com.br/sprint-discovery-ia',
  '',
  '',
  '',
  'Primeira turma prevista para outubro/2026. Página de vendas ainda em construção.',
  'Bianca Teodoro',
  '2026-07-10',
  null, null, null, null, '[]', null, '[]', '[]', '[]',
  '2026-07-10T17:00:00.000Z', '2026-07-10T17:00:00.000Z',
  'Bianca Teodoro', 'bianca.teodoro@pm3.com.br',
  'Bianca Teodoro', 'bianca.teodoro@pm3.com.br'
),
(
  '44444444-4444-4444-8444-444444444444',
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
  '["Empresas que exigem certificação formal (lato sensu) para promoção"]',
  '["Certificado reconhecido pelo MEC via instituição parceira"]',
  '["Bloco 1 — Fundamentos de gestão e estratégia de produto","Bloco 2 — Métodos ágeis e discovery","Bloco 3 — Dados e experimentação","Bloco 4 — Trabalho de conclusão"]',
  'https://pm3.com.br/pos-tech-produto',
  'https://pm3.com.br/lp/pos-tech-produto',
  'pos-tech-produto-ementa.pdf',
  '',
  'Pausado por revisão de parceria acadêmica. Retorno previsto para 2027.',
  'Camila Farinazzo',
  '2025-12-11',
  null, null, null, null, '[]', null, '[]', '[]', '[]',
  '2024-08-01T12:00:00.000Z', '2025-12-11T19:00:00.000Z',
  'Camila Farinazzo', 'camila.farinazzo@pm3.com.br',
  'Camila Farinazzo', 'camila.farinazzo@pm3.com.br'
),
(
  '55555555-5555-4555-8555-555555555555',
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
  '["Dificuldade de acompanhar o que há de mais atual em produto no Brasil","Falta de networking real com outros líderes de produto"]',
  '["Curadoria de palestrantes que constroem produto de verdade, não só palestram","Trilhas paralelas para públicos diferentes no mesmo evento"]',
  '["Manhã — Abertura e trilha principal com cases de mercado","Tarde — Trilhas paralelas por tema","Encerramento — Painel com palestrantes e networking"]',
  'https://pm3.com.br/on-stage',
  'https://pm3.com.br/lp/on-stage',
  'pm3-on-stage-apresentacao.pdf',
  '',
  'Edição 2026 confirmada para novembro. Negociação de mais 2 patrocinadores em andamento.',
  'Bianca Teodoro',
  '2026-08-05',
  24,
  3,
  '1.200',
  'Transamerica Expo Center, São Paulo — SP',
  '["Discovery","IA em Produto","Liderança","Growth","Dados"]',
  'Realizado anualmente desde 2019. Começou como um meetup de 150 pessoas e hoje é o maior evento de produto do país, com edições em São Paulo e uma edição especial online durante 2021.',
  '["Marty Cagan","Camila Farinazzo","Teresa Torres","Rodrigo Alves"]',
  '[{"nome":"Empresa Alpha","edicoes":"2023, 2024, 2025"},{"nome":"Empresa Beta","edicoes":"2024, 2025"},{"nome":"Empresa Gama","edicoes":"2025"}]',
  '[{"label":"Regulamento do evento","url":"https://pm3.com.br/on-stage/regulamento"},{"label":"Kit de imprensa","url":"https://pm3.com.br/on-stage/imprensa"},{"label":"Fotos da edição anterior","url":"https://pm3.com.br/on-stage/2025/fotos"}]',
  '2025-01-20T12:00:00.000Z', '2026-08-05T20:00:00.000Z',
  'Bianca Teodoro', 'bianca.teodoro@pm3.com.br',
  'Bianca Teodoro', 'bianca.teodoro@pm3.com.br'
);

-- ---------------------------------------------------------------------
-- PRODUTOS RELACIONADOS (mesmos vínculos do protótipo)
-- ---------------------------------------------------------------------
insert into produto_relacionados (produto_id, relacionado_id) values
  ('11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333'),
  ('11111111-1111-4111-8111-111111111111', '44444444-4444-4444-8444-444444444444'),
  ('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111'),
  ('33333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111111'),
  ('44444444-4444-4444-8444-444444444444', '11111111-1111-4111-8111-111111111111'),
  ('55555555-5555-4555-8555-555555555555', '11111111-1111-4111-8111-111111111111');

-- ---------------------------------------------------------------------
-- HISTÓRICO que já existia no protótipo
-- ---------------------------------------------------------------------
insert into produto_logs (produto_id, produto_nome, campo, resumo, autor_nome, autor_email, criado_em) values
  ('11111111-1111-4111-8111-111111111111', 'AI Product Leader', 'Observações de lançamento', 'Atualizou observações após feedback da turma piloto.', 'Camila Farinazzo', 'camila.farinazzo@pm3.com.br', '2026-08-20T18:30:00.000Z'),
  ('11111111-1111-4111-8111-111111111111', 'AI Product Leader', 'Módulos', 'Reordenou aula 4 e 5 conforme feedback de turma.', 'Camila Farinazzo', 'camila.farinazzo@pm3.com.br', '2026-06-02T13:15:00.000Z'),
  ('33333333-3333-4333-8333-333333333333', 'Sprint de Discovery com IA', 'Cadastro', 'Produto cadastrado pela primeira vez.', 'Bianca Teodoro', 'bianca.teodoro@pm3.com.br', '2026-07-10T17:00:00.000Z'),
  ('44444444-4444-4444-8444-444444444444', 'Pós-Tech em Gestão de Produtos Digitais', 'Status', 'Alterado de Ativo para Pausado (revisão de parceria).', 'Camila Farinazzo', 'camila.farinazzo@pm3.com.br', '2025-12-11T19:00:00.000Z'),
  ('22222222-2222-4222-8222-222222222222', 'Formação em Gestão de Produto', 'Carga horária', 'Corrigido de 72h para 80h.', 'Rodrigo Alves', 'rodrigo.alves@pm3.com.br', '2026-04-02T14:00:00.000Z'),
  ('55555555-5555-4555-8555-555555555555', 'PM3 On Stage', 'Patrocinadores', 'Adicionada Empresa Gama como patrocinadora da edição 2025.', 'Bianca Teodoro', 'bianca.teodoro@pm3.com.br', '2026-08-05T20:00:00.000Z');
