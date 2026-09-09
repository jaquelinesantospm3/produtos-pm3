"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ArrowLeft, Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  Campo,
  EntradaLinksUteis,
  EntradaPatrocinadores,
  EntradaTags,
  ListaTexto,
} from "@/components/campos";
import SeletorRelacionados from "@/components/SeletorRelacionados";
import EnvioPdf from "@/components/EnvioPdf";
import { CATEGORIAS, STATUS, TIMES } from "@/lib/constantes";
import { criarProduto, atualizarProduto } from "@/actions/produtos";
import type { DadosProduto, ProdutoComRelacionados, ProdutoResumo } from "@/lib/tipos";

const VAZIO: DadosProduto = {
  nome_oficial: "",
  nome_curto: "",
  categoria: "",
  status: "",
  time_responsavel: "",
  nome_responsavel: "",
  resumo: "",
  proposta_valor: "",
  publico_alvo: "",
  carga_horaria: "",
  tempo_acesso: "",
  dores: [],
  diferenciais: [],
  modulos: [],
  relacionados: [],
  link_site: "",
  link_lp: "",
  pdf_nome: "",
  pdf_path: "",
  observacoes_lancamento: "",
  evento_palestrantes: "",
  evento_palcos: "",
  evento_participantes: "",
  evento_local: "",
  evento_trilhas: [],
  evento_historico: "",
  evento_nomes_palcos: [],
  evento_patrocinadores: [],
  evento_links_uteis: [],
};

function aPartirDoProduto(produto: ProdutoComRelacionados): DadosProduto {
  return {
    nome_oficial: produto.nome_oficial,
    nome_curto: produto.nome_curto,
    categoria: produto.categoria,
    status: produto.status,
    time_responsavel: produto.time_responsavel,
    nome_responsavel: produto.nome_responsavel,
    resumo: produto.resumo,
    proposta_valor: produto.proposta_valor,
    publico_alvo: produto.publico_alvo,
    carga_horaria: produto.carga_horaria,
    tempo_acesso: produto.tempo_acesso,
    dores: produto.dores,
    diferenciais: produto.diferenciais,
    modulos: produto.modulos,
    relacionados: produto.relacionados.map((r) => r.id),
    link_site: produto.link_site,
    link_lp: produto.link_lp,
    pdf_nome: produto.pdf_nome,
    pdf_path: produto.pdf_path,
    observacoes_lancamento: produto.observacoes_lancamento,
    evento_palestrantes: produto.evento_palestrantes?.toString() ?? "",
    evento_palcos: produto.evento_palcos?.toString() ?? "",
    evento_participantes: produto.evento_participantes ?? "",
    evento_local: produto.evento_local ?? "",
    evento_trilhas: produto.evento_trilhas,
    evento_historico: produto.evento_historico ?? "",
    evento_nomes_palcos: produto.evento_nomes_palcos,
    evento_patrocinadores: produto.evento_patrocinadores,
    evento_links_uteis: produto.evento_links_uteis,
  };
}

export default function FormularioProduto({
  produto,
  disponiveis,
}: {
  produto?: ProdutoComRelacionados;
  disponiveis: ProdutoResumo[];
}) {
  const router = useRouter();
  const edicao = Boolean(produto);

  const [dados, setDados] = useState<DadosProduto>(
    produto ? aPartirDoProduto(produto) : { ...VAZIO },
  );
  const [etapa, setEtapa] = useState(1);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const ehEvento = dados.categoria === "Evento";

  function set<K extends keyof DadosProduto>(campo: K, valor: DadosProduto[K]) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
  }

  const podeAvancarDaUm = Boolean(
    dados.nome_oficial.trim() &&
      dados.categoria &&
      dados.time_responsavel &&
      dados.nome_responsavel.trim(),
  );

  async function salvar() {
    setErro("");
    if (!dados.status) {
      setErro("Escolha o status do produto para salvar.");
      return;
    }

    setSalvando(true);
    const resultado = produto
      ? await atualizarProduto(produto.id, dados)
      : await criarProduto(dados);
    setSalvando(false);

    if (!resultado.ok) {
      setErro(resultado.erro);
      return;
    }

    router.push(`/produtos/${resultado.slug}?salvo=1`);
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:px-8">
      <Link
        href={produto ? `/produtos/${produto.slug}` : "/"}
        className="mb-6 flex items-center gap-1.5 text-sm text-pm3-muted hover:text-pm3-ink"
      >
        <ArrowLeft size={15} /> {produto ? "Voltar para o produto" : "Cancelar cadastro"}
      </Link>

      <div className="mb-2 flex items-center gap-2">
        {[1, 2, 3].map((numero) => (
          <div
            key={numero}
            className={`h-1 flex-1 rounded-full ${numero <= etapa ? "bg-pm3-accent" : "bg-pm3-line"}`}
          />
        ))}
      </div>
      <p className="mb-6 text-xs text-pm3-faint">Tela {etapa} de 3</p>

      {erro && (
        <p className="mb-5 flex items-start gap-2 rounded-lg bg-pm3-descontinuado-soft px-3 py-2 text-sm text-pm3-descontinuado">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          {erro}
        </p>
      )}

      {etapa === 1 && (
        <div>
          <h1 className="mb-1 font-serif text-2xl text-pm3-ink">Identificação e governança</h1>
          <p className="mb-6 text-sm text-pm3-muted">
            Os dados básicos que definem quem é dono deste produto.
          </p>

          <Campo rotulo="Nome oficial" dica="Ex.: AI Product Leader" obrigatorio>
            <input
              value={dados.nome_oficial}
              onChange={(e) => set("nome_oficial", e.target.value)}
              placeholder="Nome completo, como aparece na venda"
              className="campo"
            />
          </Campo>

          <Campo rotulo="Nome curto" dica="Como o time chama esse produto no dia a dia. Ex.: AI PL">
            <input
              value={dados.nome_curto}
              onChange={(e) => set("nome_curto", e.target.value)}
              placeholder="Ex.: AI PL"
              className="campo"
            />
          </Campo>

          <Campo
            rotulo="Categoria"
            dica="Se escolher Evento, a próxima tela pede palestrantes, palcos, patrocinadores e outros dados de evento."
            obrigatorio
          >
            <select
              value={dados.categoria}
              onChange={(e) => set("categoria", e.target.value as DadosProduto["categoria"])}
              className="campo"
            >
              <option value="">Selecione uma categoria</option>
              {CATEGORIAS.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </Campo>

          <Campo rotulo="Time responsável" dica="Quem mantém esse produto atualizado" obrigatorio>
            <select
              value={dados.time_responsavel}
              onChange={(e) => set("time_responsavel", e.target.value)}
              className="campo"
            >
              <option value="">Selecione um time</option>
              {TIMES.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </Campo>

          <Campo rotulo="Nome do responsável" dica="Quem responde por esse produto" obrigatorio>
            <input
              value={dados.nome_responsavel}
              onChange={(e) => set("nome_responsavel", e.target.value)}
              placeholder="Ex.: Camila Farinazzo"
              className="campo"
            />
          </Campo>

          <button
            type="button"
            disabled={!podeAvancarDaUm}
            onClick={() => setEtapa(2)}
            className="botao-primario mt-2 w-full py-3"
          >
            Continuar <ChevronRight size={15} />
          </button>
          {!podeAvancarDaUm && (
            <p className="mt-2 text-center text-xs text-pm3-faint">
              Preencha nome oficial, categoria, time e responsável para continuar.
            </p>
          )}
        </div>
      )}

      {etapa === 2 && (
        <div>
          <h1 className="mb-1 font-serif text-2xl text-pm3-ink">Informações do produto</h1>
          <p className="mb-6 text-sm text-pm3-muted">O que esse produto entrega e para quem.</p>

          <Campo rotulo="Resumo" dica="2 a 3 linhas — aparece no topo da página do produto">
            <textarea
              value={dados.resumo}
              onChange={(e) => set("resumo", e.target.value)}
              rows={3}
              placeholder="O que é este produto, em poucas linhas"
              className="campo resize-none"
            />
          </Campo>

          <Campo rotulo="Proposta de valor" dica="O que esse produto resolve de verdade">
            <textarea
              value={dados.proposta_valor}
              onChange={(e) => set("proposta_valor", e.target.value)}
              rows={3}
              placeholder="Ex.: sai da sprint com uma hipótese validada e um protótipo testável"
              className="campo resize-none"
            />
          </Campo>

          <Campo rotulo="Público-alvo" dica="Para quem é este produto">
            <input
              value={dados.publico_alvo}
              onChange={(e) => set("publico_alvo", e.target.value)}
              placeholder="Ex.: PMs em transição de carreira"
              className="campo"
            />
          </Campo>

          {ehEvento ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Campo rotulo="Palestrantes">
                  <input
                    inputMode="numeric"
                    value={dados.evento_palestrantes}
                    onChange={(e) => set("evento_palestrantes", e.target.value)}
                    placeholder="Ex.: 24"
                    className="campo"
                  />
                </Campo>
                <Campo rotulo="Palcos">
                  <input
                    inputMode="numeric"
                    value={dados.evento_palcos}
                    onChange={(e) => set("evento_palcos", e.target.value)}
                    placeholder="Ex.: 3"
                    className="campo"
                  />
                </Campo>
                <Campo rotulo="Participantes">
                  <input
                    value={dados.evento_participantes}
                    onChange={(e) => set("evento_participantes", e.target.value)}
                    placeholder="Ex.: 1.200"
                    className="campo"
                  />
                </Campo>
              </div>

              <Campo rotulo="Local do evento">
                <input
                  value={dados.evento_local}
                  onChange={(e) => set("evento_local", e.target.value)}
                  placeholder="Ex.: Transamerica Expo Center, São Paulo"
                  className="campo"
                />
              </Campo>

              <Campo
                rotulo="Trilhas de conhecimento"
                dica="Digite uma trilha e pressione Enter (ou clique em Adicionar)"
              >
                <EntradaTags
                  valores={dados.evento_trilhas}
                  aoMudar={(valores) => set("evento_trilhas", valores)}
                  exemplo="Ex.: Discovery"
                />
              </Campo>

              <Campo
                rotulo="Histórico do evento"
                dica="Contexto sobre edições anteriores, quando começou, como cresceu"
              >
                <textarea
                  value={dados.evento_historico}
                  onChange={(e) => set("evento_historico", e.target.value)}
                  rows={3}
                  placeholder="Ex.: Realizado anualmente desde 2019, já reuniu mais de 5 mil pessoas..."
                  className="campo resize-none"
                />
              </Campo>

              <Campo
                rotulo="Principais nomes que já passaram pelos palcos"
                dica="Digite um nome e pressione Enter para adicionar"
              >
                <EntradaTags
                  valores={dados.evento_nomes_palcos}
                  aoMudar={(valores) => set("evento_nomes_palcos", valores)}
                  exemplo="Ex.: Marty Cagan"
                />
              </Campo>

              <Campo
                rotulo="Patrocinadores e edições"
                dica="Registre em quais edições cada patrocinador esteve presente"
              >
                <EntradaPatrocinadores
                  valores={dados.evento_patrocinadores}
                  aoMudar={(valores) => set("evento_patrocinadores", valores)}
                />
              </Campo>

              <Campo
                rotulo="Links úteis"
                dica="Adicione quantos links forem necessários (regulamento, imprensa, fotos, etc.)"
              >
                <EntradaLinksUteis
                  valores={dados.evento_links_uteis}
                  aoMudar={(valores) => set("evento_links_uteis", valores)}
                />
              </Campo>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Campo rotulo="Carga horária">
                <input
                  value={dados.carga_horaria}
                  onChange={(e) => set("carga_horaria", e.target.value)}
                  placeholder="Ex.: 40h"
                  className="campo"
                />
              </Campo>
              <Campo rotulo="Tempo de acesso">
                <input
                  value={dados.tempo_acesso}
                  onChange={(e) => set("tempo_acesso", e.target.value)}
                  placeholder="Ex.: 12 meses"
                  className="campo"
                />
              </Campo>
            </div>
          )}

          <Campo rotulo="Dores que o produto resolve" dica="Uma dor por linha">
            <ListaTexto
              valores={dados.dores}
              aoMudar={(valores) => set("dores", valores)}
              exemplo="Ex.: time pressionado a usar IA sem critério"
              rotuloBotao="Adicionar dor"
            />
          </Campo>

          <Campo rotulo="Diferenciais" dica="O que só este produto tem">
            <ListaTexto
              valores={dados.diferenciais}
              aoMudar={(valores) => set("diferenciais", valores)}
              exemplo="Ex.: mentoria em grupo quinzenal"
              rotuloBotao="Adicionar diferencial"
            />
          </Campo>

          <Campo
            rotulo={ehEvento ? "Programação" : "Módulos / conteúdo programático"}
            dica="Aparecem numerados na página do produto, na ordem em que estiverem aqui"
          >
            <ListaTexto
              valores={dados.modulos}
              aoMudar={(valores) => set("modulos", valores)}
              exemplo={ehEvento ? "Ex.: Manhã — abertura e trilha principal" : "Ex.: Módulo 1 — fundamentos"}
              rotuloBotao={ehEvento ? "Adicionar bloco" : "Adicionar módulo"}
            />
          </Campo>

          <Campo
            rotulo="Produtos relacionados"
            dica="Busque outro produto já cadastrado. O vínculo aparece nos dois lugares do catálogo."
          >
            <SeletorRelacionados
              disponiveis={disponiveis.filter((p) => p.id !== produto?.id)}
              selecionados={dados.relacionados}
              aoMudar={(ids) => set("relacionados", ids)}
            />
          </Campo>

          <Campo rotulo="Link do site" dica="Ex.: pm3.com.br/ai-product-leader">
            <input
              value={dados.link_site}
              onChange={(e) => set("link_site", e.target.value)}
              placeholder="https://pm3.com.br/..."
              className="campo"
            />
          </Campo>

          <Campo rotulo="Link da landing page" dica="A página de vendas, se já existir">
            <input
              value={dados.link_lp}
              onChange={(e) => set("link_lp", e.target.value)}
              placeholder="https://pm3.com.br/lp/..."
              className="campo"
            />
          </Campo>

          <Campo
            rotulo={ehEvento ? "Material do evento (PDF)" : "PDF do produto"}
            dica="Envie a ementa ou apresentação oficial em PDF"
          >
            <EnvioPdf
              nomeArquivo={dados.pdf_nome}
              rotulo="Clique para selecionar um arquivo PDF"
              aoEnviar={({ pdf_nome, pdf_path }) => {
                setDados((atual) => ({ ...atual, pdf_nome, pdf_path }));
              }}
            />
          </Campo>

          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => setEtapa(1)} className="botao-secundario px-4 py-3">
              <ChevronLeft size={15} /> Voltar
            </button>
            <button type="button" onClick={() => setEtapa(3)} className="botao-primario flex-1 py-3">
              Continuar <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {etapa === 3 && (
        <div>
          <h1 className="mb-1 font-serif text-2xl text-pm3-ink">Status e observações</h1>
          <p className="mb-6 text-sm text-pm3-muted">
            {edicao
              ? "Última etapa antes de salvar as alterações."
              : "Última etapa antes de publicar o registro deste produto."}
          </p>

          <Campo rotulo="Status do produto" obrigatorio>
            <div className="flex flex-wrap gap-2">
              {STATUS.map((status) => {
                const escolhido = dados.status === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => set("status", status)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      escolhido
                        ? "border-pm3-ink bg-pm3-ink text-white"
                        : "border-pm3-line bg-pm3-surface text-pm3-ink hover:border-pm3-line-strong"
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </Campo>

          <Campo
            rotulo="Observações de lançamento"
            dica="Opcional — contexto útil para quem for revisar depois"
          >
            <textarea
              value={dados.observacoes_lancamento}
              onChange={(e) => set("observacoes_lancamento", e.target.value)}
              rows={3}
              placeholder="Ex.: turma piloto, aguardando ajuste na página de vendas..."
              className="campo resize-none"
            />
          </Campo>

          <p className="mb-5 text-xs text-pm3-faint">
            A data da alteração é gravada automaticamente. Enquanto o sistema estiver sem login,
            o histórico registra as mudanças como &ldquo;Modo de teste&rdquo;.
          </p>

          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => setEtapa(2)} className="botao-secundario px-4 py-3">
              <ChevronLeft size={15} /> Voltar
            </button>
            <button
              type="button"
              disabled={!dados.status || salvando}
              onClick={salvar}
              className="botao-primario flex-1 py-3"
            >
              {salvando ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {salvando ? "Salvando..." : edicao ? "Salvar alterações" : "Salvar produto"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
