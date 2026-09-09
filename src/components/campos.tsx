"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { LinkUtil, Patrocinador } from "@/lib/tipos";

/** Rótulo + campo + exemplo, o mesmo desenho em todos os formulários. */
export function Campo({
  rotulo,
  dica,
  obrigatorio,
  children,
}: {
  rotulo: string;
  dica?: string;
  obrigatorio?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <label className="mb-1 block text-sm font-medium text-pm3-ink">
        {rotulo}
        {obrigatorio && <span className="ml-1 text-pm3-accent">*</span>}
      </label>
      {children}
      {dica && <p className="mt-1 text-xs text-pm3-faint">{dica}</p>}
    </div>
  );
}

/**
 * Tags: digita e aperta Enter (ou clica em Adicionar); cada item vira um
 * chip que sai com um clique no X.
 */
export function EntradaTags({
  valores,
  aoMudar,
  exemplo,
}: {
  valores: string[];
  aoMudar: (valores: string[]) => void;
  exemplo: string;
}) {
  const [texto, setTexto] = useState("");

  function adicionar() {
    const valor = texto.trim();
    if (valor && !valores.includes(valor)) aoMudar([...valores, valor]);
    setTexto("");
  }

  return (
    <div>
      {valores.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {valores.map((valor, i) => (
            <span
              key={valor}
              className="inline-flex items-center gap-1 rounded-full bg-pm3-accent-soft px-2.5 py-1 text-xs text-pm3-accent-ink"
            >
              {valor}
              <button
                type="button"
                onClick={() => aoMudar(valores.filter((_, indice) => indice !== i))}
                aria-label={`Remover ${valor}`}
                className="hover:opacity-70"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              adicionar();
            }
          }}
          placeholder={exemplo}
          className="campo-menor flex-1"
        />
        <button type="button" onClick={adicionar} className="botao-secundario shrink-0">
          Adicionar
        </button>
      </div>
    </div>
  );
}

/**
 * Lista de frases (dores, diferenciais, módulos): uma linha por item,
 * cada uma com seu campo de texto e um X para remover.
 */
export function ListaTexto({
  valores,
  aoMudar,
  exemplo,
  rotuloBotao,
}: {
  valores: string[];
  aoMudar: (valores: string[]) => void;
  exemplo: string;
  rotuloBotao: string;
}) {
  return (
    <div className="space-y-2">
      {valores.map((valor, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={valor}
            onChange={(e) =>
              aoMudar(valores.map((atual, indice) => (indice === i ? e.target.value : atual)))
            }
            placeholder={exemplo}
            className="campo-menor flex-1"
          />
          <button
            type="button"
            onClick={() => aoMudar(valores.filter((_, indice) => indice !== i))}
            aria-label="Remover item"
            className="px-1 text-pm3-faint hover:text-pm3-ink"
          >
            <X size={15} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => aoMudar([...valores, ""])}
        className="flex items-center gap-1 text-xs font-medium text-pm3-accent-ink"
      >
        <Plus size={12} /> {rotuloBotao}
      </button>
    </div>
  );
}

/** Patrocinadores: nome + em quais edições participou. */
export function EntradaPatrocinadores({
  valores,
  aoMudar,
}: {
  valores: Patrocinador[];
  aoMudar: (valores: Patrocinador[]) => void;
}) {
  function atualizar(i: number, campo: keyof Patrocinador, valor: string) {
    aoMudar(valores.map((linha, indice) => (indice === i ? { ...linha, [campo]: valor } : linha)));
  }

  return (
    <div className="space-y-2">
      {valores.map((linha, i) => (
        <div key={i} className="flex flex-col gap-2 sm:flex-row">
          <input
            value={linha.nome}
            onChange={(e) => atualizar(i, "nome", e.target.value)}
            placeholder="Nome do patrocinador"
            className="campo-menor flex-1"
          />
          <div className="flex gap-2">
            <input
              value={linha.edicoes}
              onChange={(e) => atualizar(i, "edicoes", e.target.value)}
              placeholder="Edições (ex.: 2024, 2025)"
              className="campo-menor flex-1"
            />
            <button
              type="button"
              onClick={() => aoMudar(valores.filter((_, indice) => indice !== i))}
              aria-label="Remover patrocinador"
              className="px-1 text-pm3-faint hover:text-pm3-ink"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => aoMudar([...valores, { nome: "", edicoes: "" }])}
        className="flex items-center gap-1 text-xs font-medium text-pm3-accent-ink"
      >
        <Plus size={12} /> Adicionar patrocinador
      </button>
    </div>
  );
}

/** Links úteis: quantos forem necessários, cada um com rótulo e endereço. */
export function EntradaLinksUteis({
  valores,
  aoMudar,
}: {
  valores: LinkUtil[];
  aoMudar: (valores: LinkUtil[]) => void;
}) {
  function atualizar(i: number, campo: keyof LinkUtil, valor: string) {
    aoMudar(valores.map((linha, indice) => (indice === i ? { ...linha, [campo]: valor } : linha)));
  }

  return (
    <div className="space-y-2">
      {valores.map((linha, i) => (
        <div key={i} className="flex flex-col gap-2 sm:flex-row">
          <input
            value={linha.label}
            onChange={(e) => atualizar(i, "label", e.target.value)}
            placeholder="Nome do link (ex.: Regulamento)"
            className="campo-menor sm:w-44 sm:shrink-0"
          />
          <div className="flex flex-1 gap-2">
            <input
              value={linha.url}
              onChange={(e) => atualizar(i, "url", e.target.value)}
              placeholder="https://..."
              className="campo-menor flex-1"
            />
            <button
              type="button"
              onClick={() => aoMudar(valores.filter((_, indice) => indice !== i))}
              aria-label="Remover link"
              className="px-1 text-pm3-faint hover:text-pm3-ink"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => aoMudar([...valores, { label: "", url: "" }])}
        className="flex items-center gap-1 text-xs font-medium text-pm3-accent-ink"
      >
        <Plus size={12} /> Adicionar link
      </button>
    </div>
  );
}
