# Produtos PM3

A fonte única da verdade sobre cada produto da PM3 — cursos, formações, pós-tech, eventos,
in-company, memberships, sprints e stacks. Cada produto tem um registro só, com dono, data de
atualização e histórico de quem mexeu em quê.

Feito em Next.js + TypeScript + Tailwind, rodando inteiro na Cloudflare:

| Peça | Onde fica |
|---|---|
| Aplicação (telas, gravação, rotas) | **Cloudflare Workers** |
| Banco de dados | **Cloudflare D1** (SQLite) |
| PDFs dos produtos | **Cloudflare R2** |
| Quem pode entrar | **Cloudflare Access** |

> Este projeto usa Workers, e não Pages, porque precisa executar lógica no servidor: as telas
> são renderizadas sob demanda, a gravação passa por server actions e há rotas que leem o banco
> e entregam arquivos.

**Não existe tela de login neste projeto, e nem deve existir.** Quem decide se a pessoa entra é
o Cloudflare Access, na borda da rede, antes da requisição chegar na aplicação. Depois que a
pessoa passa, o Access anexa o e-mail dela na requisição — é assim que o histórico sabe assinar
cada alteração.

---

## Onde já está no ar

| | |
|---|---|
| Endereço | <https://produtos.pm3.com.br> |
| Conta Cloudflare | `Admins@cursospm3.com.br` (a que tem o domínio pm3.com.br) |
| Worker | `produtos-pm3` — sem endereço `.workers.dev`, de propósito |
| Banco D1 | `produtos-pm3` (`2964c432-a7ce-4347-8490-e2f8e45f5b57`), tabelas já criadas |
| Bucket R2 | `produtos-pm3-pdf`, privado |
| Access | a organização `cursospm3` já exige identificação nesse endereço |

O catálogo em produção começa **vazio**, de propósito: os produtos de exemplo são fictícios e
não devem entrar num sistema que é a fonte da verdade. Para cadastrar, use o botão **Novo
produto**. Se quiser mesmo os exemplos, o comando está no [passo 4](#4-colocar-os-produtos-de-exemplo).

Para publicar uma alteração: `npm run deploy`.

O guia abaixo serve para entender o funcionamento e para refazer o ambiente do zero, se um dia
for preciso.

---

## Índice

1. [O que você vai precisar](#1-o-que-você-vai-precisar)
2. [Criar o banco e o bucket](#2-criar-o-banco-e-o-bucket)
3. [Criar as tabelas](#3-criar-as-tabelas)
4. [Colocar os produtos de exemplo](#4-colocar-os-produtos-de-exemplo)
5. [Rodar no seu computador](#5-rodar-no-seu-computador)
6. [Publicar o Worker](#6-publicar-o-worker)
7. [Proteger com o Cloudflare Access](#7-proteger-com-o-cloudflare-access)
8. [Como o sistema funciona](#8-como-o-sistema-funciona)
9. [Como o banco está organizado](#9-como-o-banco-está-organizado)
10. [Problemas comuns](#10-problemas-comuns)

---

## 1. O que você vai precisar

- [Node.js](https://nodejs.org) versão 20 ou mais nova (o instalador padrão serve).
- Uma conta na Cloudflare com um domínio já apontado para ela (o Access precisa de domínio).
- Acesso de administrador no painel da Cloudflare, para criar o Access e os recursos.

Instale as dependências do projeto uma vez:

```bash
npm install
```

E faça login na Cloudflare pelo terminal:

```bash
npx wrangler login
```

---

## 2. Criar o banco e o bucket

Rode os dois comandos abaixo. Eles criam o banco de dados e a pasta de arquivos.

```bash
npx wrangler d1 create produtos-pm3
npx wrangler r2 bucket create produtos-pm3-pdf
```

O primeiro comando devolve um `database_id`. **Copie esse identificador e cole no arquivo
`wrangler.jsonc`**, no lugar de `COLE-AQUI-O-ID-DO-D1`.

O bucket do R2 fica privado, e é assim que tem que ficar: ninguém alcança um PDF pela internet
sem passar pela aplicação.

---

## 3. Criar as tabelas

Na sua máquina:

```bash
npm run banco:local
```

Em produção:

```bash
npm run banco:producao
```

Os dois comandos leem os arquivos da pasta `migrations/` e criam o que ainda não existe. Rodar
de novo não quebra nada: o que já foi aplicado é pulado.

---

## 4. Colocar os produtos de exemplo

Opcional — serve para ver o catálogo com conteúdo antes de cadastrar os produtos de verdade.

```bash
# na sua máquina
npx wrangler d1 execute produtos-pm3 --local  --file=./banco/exemplos.sql

# em produção
npx wrangler d1 execute produtos-pm3 --remote --file=./banco/exemplos.sql
```

São 5 produtos, com vínculos e histórico. Pode rodar mais de uma vez: ele apaga e recria só
esses 5, sem tocar no resto.

---

## 5. Rodar no seu computador

```bash
npm run dev
```

Abra <http://localhost:3000>. O banco e os arquivos usados aqui são cópias locais, guardadas na
pasta `.wrangler` — mexer à vontade não afeta produção.

Para testar exatamente como vai rodar publicado (aplicação já empacotada no Worker):

```bash
npm run preview
```

> Sem o Access na frente, a aplicação não tem como saber quem você é. Nesse caso o histórico
> assina as alterações como **"Ambiente local"**. Isso vale só na sua máquina.

---

## 6. Publicar o Worker

```bash
npm run deploy
```

O comando monta o pacote e publica em <https://produtos.pm3.com.br>. O subdomínio é criado pelo
próprio deploy, a partir do bloco `routes` do `wrangler.jsonc`.

Se for a primeira vez, rode também as migrações em produção (passo 3) e, se quiser, os produtos
de exemplo (passo 4).

> ⚠️ **Um Worker publicado sem o Access na frente fica aberto para qualquer pessoa da
> internet.** Confira o passo 7 antes de divulgar o link ou cadastrar informação real.

---

## 7. Proteger com o Cloudflare Access

É aqui que o login acontece — fora da aplicação.

> **No ambiente atual isso já está valendo:** abrir <https://produtos.pm3.com.br> sem estar
> identificado leva para a tela de entrada da organização `cursospm3`. O que vale conferir uma
> vez em **Zero Trust → Access → Applications** é se a política que cobre esse endereço libera
> exatamente quem deve entrar (o esperado é *Emails ending in* `@pm3.com.br`) — e não uma regra
> mais larga, herdada de outro sistema. O roteiro abaixo é para montar do zero.

1. No painel da Cloudflare, entre em **Zero Trust → Access → Applications** e clique em
   **Add an application → Self-hosted**.
2. Dê um nome (ex.: `Produtos PM3`) e informe o domínio onde o sistema vai atender
   (ex.: `produtos.pm3.com.br`). Aponte esse domínio para o Worker em
   **Workers & Pages → produtos-pm3 → Settings → Domains & Routes**.
3. Crie uma política de acesso:
   - **Action:** Allow
   - **Include → Emails ending in:** `@pm3.com.br`

   Só com isso, qualquer pessoa com e-mail da PM3 entra, e mais ninguém.
4. Em **Settings → Login methods**, escolha como as pessoas se identificam (Google Workspace,
   se a PM3 usa; ou o código por e-mail, que não exige configuração nenhuma).
5. Salve e abra o endereço numa janela anônima para conferir que ele pede identificação.

Depois disso:

- O nome de quem está usando aparece no canto superior direito.
- O botão de sair usa `/cdn-cgi/access/logout`, que encerra a sessão na própria Cloudflare.
- Toda alteração no histórico sai assinada com o nome e o e-mail reais da pessoa.

> **Importante:** o sistema deve ser alcançável **apenas** pelo domínio protegido pelo Access.
> O endereço `.workers.dev` seria um caminho paralelo, sem política nenhuma — por isso o
> `wrangler.jsonc` traz `"workers_dev": false`. Não ligue de volta.

---

## 8. Como o sistema funciona

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
produto e por pessoa. Ninguém escreve nesses registros à mão: quem grava é a própria aplicação,
comparando o que estava no banco com o que foi enviado, em `src/lib/historico.ts`.

**Manutenção** — edição rápida só dos campos de governança (dono, time, status, revisão). Para
mexer no resto, use "Editar todos os campos deste produto" ou o botão **Editar** na página do
produto.

**PDF do produto** — o arquivo enviado no formulário vai para o Worker, que grava no bucket do
R2. Para baixar, a rota `/produtos/{slug}/pdf` lê o objeto e entrega. Como o bucket é privado e
o Access está na frente, o arquivo nunca fica exposto.

---

## 9. Como o banco está organizado

Três tabelas, todas no D1:

- **`produtos`** — um registro por produto, com tudo que aparece no one-pager.
- **`produto_relacionados`** — quais produtos se conectam a quais.
- **`produto_logs`** — o histórico de alterações.

Não existe tabela de usuários: quem é quem vem do Cloudflare Access.

**Um detalhe que costuma confundir:** o D1 é SQLite, e SQLite não tem coluna de lista. Então as
listas (dores, diferenciais, módulos, trilhas, patrocinadores, links úteis) ficam guardadas como
texto em formato JSON. A aplicação converte na leitura e na escrita — ver `src/lib/banco.ts`.
Se você for consultar o banco na mão, use as funções `json_extract` e `json_array_length` do
próprio SQLite.

### Onde mexer no código

```
src/app/(app)/            as telas (catálogo, produto, cadastro, logs, manutenção)
src/app/api/pdf/          recebe o arquivo enviado e grava no R2
src/actions/              o que grava no banco (server actions)
src/components/           peças reaproveitadas (campos, tags, upload, barra do topo)
src/lib/acesso.ts         quem está usando, lido dos cabeçalhos do Access
src/lib/banco.ts          conexão com o D1 e o R2, e a conversão das listas
src/lib/dados.ts          as consultas de leitura
src/lib/historico.ts      a comparação que gera o log de alteração
migrations/               a estrutura do banco
banco/exemplos.sql        os produtos de exemplo
wrangler.jsonc            nome do Worker, banco e bucket
```

Para mudar as categorias, os times ou o prazo de revisão (hoje 90 dias), edite
`src/lib/constantes.ts` — e, no caso das categorias e dos status, ajuste também a lista
permitida em `migrations/0001_inicial.sql` (numa migração nova, se o banco já estiver em
produção).

---

## 10. Problemas comuns

**"D1_ERROR" ou a tela de erro ao abrir o catálogo**
As tabelas ainda não foram criadas. Rode `npm run banco:local` (ou `npm run banco:producao`).

**O deploy reclama do `database_id`**
Você ainda não colou no `wrangler.jsonc` o identificador que o `wrangler d1 create` devolveu.

**O nome no canto da tela aparece como "Ambiente local"**
É o esperado quando você roda na sua máquina, onde não há Access. Publicado e com o Access
configurado, aparece o nome real.

**Entrei pelo endereço e ele não pediu identificação**
Ou o Access ainda não foi configurado (passo 7), ou alguém religou o endereço `.workers.dev`,
que não passa pela política. Desligue esse endereço.

**O PDF não abre**
Confira se o produto tem arquivo enviado (a rota devolve 404 quando não tem) e se o bucket do
R2 foi criado com o mesmo nome que está no `wrangler.jsonc`.

**Mudei os bindings e o TypeScript reclama**
Rode `npm run tipos` para regerar o `cloudflare-env.d.ts`.
