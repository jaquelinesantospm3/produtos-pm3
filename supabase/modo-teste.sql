-- =====================================================================
-- MODO DE TESTE — libera o sistema sem login
--
-- ATENÇÃO: enquanto este arquivo estiver aplicado, QUALQUER PESSOA com o
-- endereço do site consegue ver e editar todos os produtos. Não existe
-- login, não existe dono da alteração. Use só nesta fase de testes e não
-- coloque aqui nenhum dado sensível.
--
-- Rode DEPOIS do schema.sql (e do seed.sql, se quiser os exemplos).
-- Para voltar a exigir login: rode o schema.sql de novo, que ele restaura
-- as regras restritas por cima destas.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. Regras de acesso abertas para as tabelas
-- ---------------------------------------------------------------------
drop policy if exists "produtos: pm3 le"    on public.produtos;
drop policy if exists "produtos: pm3 cria"  on public.produtos;
drop policy if exists "produtos: pm3 edita" on public.produtos;
drop policy if exists "produtos: pm3 apaga" on public.produtos;
drop policy if exists "produtos: teste"     on public.produtos;
create policy "produtos: teste" on public.produtos
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "relacionados: pm3 le"    on public.produto_relacionados;
drop policy if exists "relacionados: pm3 cria"  on public.produto_relacionados;
drop policy if exists "relacionados: pm3 apaga" on public.produto_relacionados;
drop policy if exists "relacionados: teste"     on public.produto_relacionados;
create policy "relacionados: teste" on public.produto_relacionados
  for all to anon, authenticated using (true) with check (true);

-- Os logs continuam só de leitura: quem escreve neles é o gatilho.
drop policy if exists "logs: pm3 le" on public.produto_logs;
drop policy if exists "logs: teste"  on public.produto_logs;
create policy "logs: teste" on public.produto_logs
  for select to anon, authenticated using (true);

drop policy if exists "perfis: pm3 le"      on public.perfis;
drop policy if exists "perfis: edita o seu" on public.perfis;
drop policy if exists "perfis: teste"       on public.perfis;
create policy "perfis: teste" on public.perfis
  for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------
-- 2. Regras de acesso abertas para os PDFs
-- ---------------------------------------------------------------------
drop policy if exists "pdf: pm3 le"    on storage.objects;
drop policy if exists "pdf: pm3 envia" on storage.objects;
drop policy if exists "pdf: pm3 troca" on storage.objects;
drop policy if exists "pdf: pm3 apaga" on storage.objects;
drop policy if exists "pdf: teste"     on storage.objects;
create policy "pdf: teste" on storage.objects
  for all to anon, authenticated
  using (bucket_id = 'produtos-pdf')
  with check (bucket_id = 'produtos-pdf');

-- ---------------------------------------------------------------------
-- 3. Quem assina as alterações enquanto não há login
--    Sem login não há como saber quem mexeu, então todo registro do
--    histórico sai assinado como "Modo de teste". Quando o login voltar,
--    o schema.sql restaura a assinatura com nome e e-mail de verdade.
-- ---------------------------------------------------------------------
create or replace function public.autor_atual(out nome text, out email text)
language plpgsql
stable
as $$
begin
  email := coalesce(auth.jwt() ->> 'email', '');
  select p.nome into nome from public.perfis p where p.id = auth.uid();

  if nome is null then
    nome := case when email = '' then 'Modo de teste' else public.nome_a_partir_do_email(email) end;
  end if;
  if email = '' then
    email := 'teste@pm3.com.br';
  end if;
end;
$$;

commit;
