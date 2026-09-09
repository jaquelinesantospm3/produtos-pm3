# Produtos PM3

A fonte única da verdade sobre cada produto da PM3 — cursos, formações, pós-tech, eventos,
in-company, memberships, sprints e stacks. Cada produto tem um registro só, com dono, data de
atualização e histórico de quem mexeu em quê.

Feito em Next.js + TypeScript + Tailwind, com Supabase (banco de dados e arquivos) e deploy na
Vercel.

> ## ⚠️ Este projeto está em modo de teste, sem login
>
> Nesta fase não existe tela de entrada: quem abrir o endereço vê e edita tudo. As alterações
> aparecem no histórico assinadas como "Modo de teste", porque não há como saber quem mexeu.
>
> Não coloque aqui informação que não possa vazar, e evite divulgar o endereço fora do time.
> Como religar o login está na [seção 10](#10-como-religar-o-login-depois).

---

## Índice

1. [O que você vai precisar](#1-o-que-você-vai-precisar)
2. [Criar o projeto no Supabase](#2-criar-o-projeto-no-supabase)
3. [Criar as tabelas](#3-criar-as-tabelas)
4. [Colocar os produtos de exemplo](#4-colocar-os-produtos-de-exemplo)
5. [Liberar o acesso sem login](#5-liberar-o-acesso-sem-login)
6. [Rodar no seu computador](#6-rodar-no-seu-computador)
7. [Subir o código para o GitHub](#7-subir-o-código-para-o-github)
8. [Publicar na Vercel](#8-publicar-na-vercel)
9. [Como o sistema funciona](#9-como-o-sistema-funciona)
10. [Como religar o login depois](#10-como-religar-o-login-depois)
11. [Como o banco está organizado](#11-como-o-banco-está-organizado)
12. [Problemas comuns](#12-problemas-comuns)

---

## 1. O que você vai precisar

- Uma conta no [Supabase](https://supabase.com) (o plano gratuito serve).
- Uma conta no [GitHub](https://github.com).
- Uma conta na [Vercel](https://vercel.com) (dá para entrar com o GitHub).
- Node.js instalado no computador, se quiser rodar localmente ([nodejs.org](https://nodejs.org)).

Nada aqui precisa de cartão de crédito.

---

## 2. Criar o projeto no Supabase

1. Entre em [supabase.com](https://supabase.com) e clique em **New project**.
2. Dê um nome (ex.: `produtos-pm3`), escolha a região **South America (São Paulo)** e crie uma
   senha para o banco. **Guarde essa senha** num lugar seguro — você não vai precisar dela no
   dia a dia, mas ela não aparece de novo.
3. Espere uns 2 minutos até o projeto ficar pronto.

---

## 3. Criar as tabelas

1. No menu da esquerda do Supabase, clique em **SQL Editor**.
2. Clique em **New query**.
3. Abra o arquivo `supabase/schema.sql` deste projeto, copie **tudo** e cole na janela.
4. Clique em **Run** (ou aperte Ctrl+Enter).
5. Deve aparecer "Success. No rows returned". Pronto: tabelas, histórico automático e a pasta
   de PDFs foram criados de uma vez.

Você só precisa fazer isso uma vez.

---

## 4. Colocar os produtos de exemplo

Mesma coisa, com o outro arquivo:

1. **SQL Editor** → **New query**.
2. Copie todo o conteúdo de `supabase/seed.sql`, cole e clique em **Run**.

Isso cadastra os 5 produtos de exemplo (AI Product Leader, Formação em Gestão de Produto,
Sprint de Discovery com IA, Pós-Tech em Gestão de Produtos Digitais e o evento PM3 On Stage,
com todos os campos de evento preenchidos) e o histórico de alterações deles.

Se rodar de novo, ele apaga e recria só esses 5 — não mexe em nada que você tiver cadastrado
depois.

---

## 5. Liberar o acesso sem login

O `schema.sql` deixa o banco fechado: só quem entra com e-mail `@pm3.com.br` enxerga alguma
coisa. Como nesta fase não existe login, é preciso abrir o acesso, senão o catálogo aparece
vazio.

1. **SQL Editor** → **New query**.
2. Copie todo o conteúdo de `supabase/modo-teste.sql`, cole e clique em **Run**.

Feito isso, qualquer pessoa com o endereço do site consegue ver e editar os produtos, e o
histórico passa a registrar as mudanças como "Modo de teste".

**Faça isso só enquanto estiver testando.** Quando quiser fechar de novo, é a
[seção 10](#10-como-religar-o-login-depois).

---

## 6. Rodar no seu computador

1. Baixe/clone este projeto.
2. Dentro da pasta, copie o arquivo `.env.local.example` e renomeie a cópia para `.env.local`.
3. No Supabase, vá em **Project Settings → API** e copie:
   - **Project URL** → cole em `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** (a chave pública) → cole em `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   O arquivo fica assim:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

   **Nunca** use aqui a chave `service_role`.

4. No terminal, dentro da pasta do projeto:

   ```bash
   npm install
   ```

   ```bash
   npm run dev
   ```

5. Abra <http://localhost:3000>. O catálogo aparece direto, sem pedir nada.

---

## 7. Subir o código para o GitHub

Já está no GitHub, em <https://github.com/jaquelinesantospm3/produtos-pm3> (repositório
privado). Para mandar alterações novas:

```bash
git add -A
```

```bash
git commit -m "descreva o que mudou"
```

```bash
git push
```

O arquivo `.env.local` **não** vai para o GitHub (ele está no `.gitignore`), e é assim que
tem que ser.

---

## 8. Publicar na Vercel

1. Entre em [vercel.com](https://vercel.com) com sua conta do GitHub.
2. Clique em **Add New → Project** e escolha o repositório `produtos-pm3`.
3. A Vercel reconhece o Next.js sozinha. Não mude nada em build.
4. Antes de clicar em Deploy, abra **Environment Variables** e cadastre as duas mesmas
   variáveis do `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Clique em **Deploy** e espere terminar.
6. Pronto. Toda vez que você fizer `git push`, a Vercel publica sozinha a versão nova.

> Enquanto estiver sem login, o endereço da Vercel fica aberto para quem tiver o link. Se
> quiser esconder de estranhos durante os testes, dá para ligar o **Deployment Protection**
> nas configurações do projeto na Vercel — aí só quem tem conta no seu time entra.

---

## 9. Como o sistema funciona

**Catálogo** — todos os produtos, com busca por nome ou descrição, filtro por categoria e por
status. Produtos sem atualização há mais de 90 dias aparecem marcados com "Precisa de revisão".

**Página do produto (one pager)** — o registro oficial. Tem "Copiar link" (para mandar no
Slack) e "Exportar PDF", que usa a impressão do navegador com um layout limpo: na janela que
abrir, escolha "Salvar como PDF".

**Cadastro em 3 telas** — identificação e governança → informações do produto → status e
observações. Dá para ir e voltar sem perder nada. Na tela 2, os campos mudam conforme a
categoria escolhida na tela 1: se for **Evento**, no lugar de carga horária e tempo de acesso
aparecem palestrantes, palcos e participantes, mais local, trilhas de conhecimento, histórico
do evento, nomes que já subiram ao palco, patrocinadores (com as edições) e links úteis.

**Logs** — toda alteração de todo produto, com data, campo e resumo do que mudou. Filtra por
produto e por pessoa. Ninguém escreve nesses registros à mão: o próprio banco de dados grava.
Enquanto não houver login, todas as linhas saem assinadas como "Modo de teste".

**Manutenção** — edição rápida só dos campos de governança (dono, time, status, revisão). Para
mexer no resto, use "Editar todos os campos deste produto" ou o botão **Editar** na página do
produto.

---

## 10. Como religar o login depois

Quando a fase de testes acabar, são dois passos:

1. **No banco:** rode o `supabase/schema.sql` de novo, inteiro, no SQL Editor. Ele restaura as
   regras restritas por cima das regras abertas do modo de teste e volta a assinar as
   alterações com nome e e-mail de quem está logado.

2. **No código:** o login por link mágico está pronto no histórico do Git — foi retirado num
   commit só. Para trazer de volta, desfaça esse commit:

   ```bash
   git revert $(git log --grep="modo de teste" -i --format=%H -n 1)
   ```

   Isso devolve a tela de login, o bloqueio por domínio `@pm3.com.br` em todas as camadas, a
   tela "Meu perfil" e a assinatura automática das alterações. Depois é só apagar o
   `supabase/modo-teste.sql` e conferir as **Redirect URLs** no Supabase
   (**Authentication → URL Configuration**): a Site URL precisa ser o endereço da Vercel, e
   `https://SEU-PROJETO.vercel.app/**` precisa estar na lista, senão o link do e-mail não
   funciona.

Se preferir, me chame que eu faço essa volta.

---

## 11. Como o banco está organizado

| Tabela                  | Para que serve                                                        |
| ----------------------- | --------------------------------------------------------------------- |
| `produtos`              | Um registro por produto, com os campos comuns e os de evento          |
| `produto_relacionados`  | Liga um produto a outro (vínculo de verdade, não texto solto)         |
| `produto_logs`          | Histórico de alterações, preenchido automaticamente pelo banco        |
| `perfis`                | Nome e e-mail de quem usa o sistema (só volta a ser usada com o login) |

**Campos de evento.** Ficam na própria tabela `produtos`, com o prefixo `evento_`
(`evento_palestrantes`, `evento_local`, `evento_patrocinadores`...). Em produtos que não são
eventos essas colunas ficam vazias, e a aplicação nem mostra os campos. Optamos por isso em
vez de uma tabela separada porque a relação seria sempre de um para um: assim a página do
produto sai numa consulta só e fica mais fácil de entender quem olha a tabela.

**Histórico automático.** Um gatilho (`trigger`) compara o valor antigo e o novo de cada campo
a cada alteração e grava uma linha no log com o nome legível do campo, um resumo em português
e o autor. Vale inclusive para alterações feitas direto no painel do Supabase.

**PDFs.** Ficam num bucket chamado `produtos-pdf`. O link de download é gerado na hora e vale
5 minutos, então o arquivo não fica exposto num endereço fixo.

### Onde mexer no código

```
src/app/(app)/            as telas (catálogo, produto, cadastro, logs, manutenção)
src/actions/              o que grava no banco (server actions)
src/components/           peças reaproveitadas (campos, tags, upload, barra do topo)
src/lib/                  tipos, cores, formatação de data e acesso ao Supabase
supabase/                 schema.sql, seed.sql e modo-teste.sql
```

Para mudar as categorias, os times ou o prazo de revisão (hoje 90 dias), edite
`src/lib/constantes.ts` — e, no caso das categorias, ajuste também a lista permitida em
`supabase/schema.sql`.

---

## 12. Problemas comuns

**O catálogo aparece vazio, mas os produtos estão no Supabase.** — falta rodar o
`supabase/modo-teste.sql` (seção 5). Sem ele o banco continua fechado para quem não fez login.

**"Não conseguimos carregar os produtos".** — confira se as duas variáveis de ambiente estão
certas (sem espaço sobrando) e se o projeto do Supabase está ativo. Projetos gratuitos sem uso
por muito tempo entram em pausa e precisam ser reativados no painel.

**Não consigo enviar o PDF.** — o arquivo precisa ser PDF e ter menos de 20 MB. Se continuar,
verifique se o `modo-teste.sql` foi rodado: é ele que libera o envio sem login.

**O produto não aparece no catálogo.** — confira o filtro de categoria e de status no topo da
lista.

**Todas as alterações aparecem como "Modo de teste".** — é o esperado enquanto não houver
login. Com o login de volta, cada linha passa a mostrar o nome e o e-mail de quem alterou.
