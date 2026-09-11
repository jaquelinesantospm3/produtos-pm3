"use client";

import { useRef, useState } from "react";
import { Check, FileText, Loader2, X } from "lucide-react";

const TAMANHO_MAXIMO_MB = 20;

/**
 * Envia o PDF para o Worker, que grava no bucket do R2 e devolve o caminho.
 * O arquivo já fica gravado no envio; o formulário só guarda a referência.
 */
export default function EnvioPdf({
  nomeArquivo,
  aoEnviar,
  rotulo,
}: {
  nomeArquivo: string;
  aoEnviar: (dados: { pdf_nome: string; pdf_path: string }) => void;
  rotulo: string;
}) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function selecionar(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;
    setErro("");

    if (arquivo.type !== "application/pdf" && !arquivo.name.toLowerCase().endsWith(".pdf")) {
      setErro("O arquivo precisa ser um PDF.");
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_MB * 1024 * 1024) {
      setErro(`O arquivo é muito grande. O limite é ${TAMANHO_MAXIMO_MB} MB.`);
      return;
    }

    setEnviando(true);

    const corpo = new FormData();
    corpo.append("arquivo", arquivo);

    try {
      const resposta = await fetch("/api/pdf", { method: "POST", body: corpo });
      const dados = (await resposta.json()) as {
        pdf_nome?: string;
        pdf_path?: string;
        erro?: string;
      };

      if (!resposta.ok || !dados.pdf_path) {
        setErro(dados.erro ?? "Não conseguimos enviar o arquivo agora. Tente de novo.");
        return;
      }

      aoEnviar({ pdf_nome: dados.pdf_nome ?? arquivo.name, pdf_path: dados.pdf_path });
    } catch {
      setErro("Não conseguimos enviar o arquivo agora. Tente de novo em alguns segundos.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <label
        className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-pm3-line-strong py-4 text-sm ${
          nomeArquivo ? "text-pm3-ink" : "text-pm3-muted"
        }`}
      >
        {enviando ? (
          <Loader2 size={15} className="animate-spin" />
        ) : nomeArquivo ? (
          <Check size={15} className="text-pm3-ativo" />
        ) : (
          <FileText size={15} />
        )}
        {enviando ? "Enviando arquivo..." : nomeArquivo || rotulo}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={selecionar}
          disabled={enviando}
        />
      </label>

      {nomeArquivo && !enviando && (
        <button
          type="button"
          onClick={() => {
            aoEnviar({ pdf_nome: "", pdf_path: "" });
            if (inputRef.current) inputRef.current.value = "";
          }}
          className="mt-1 flex items-center gap-1 text-xs text-pm3-faint hover:text-pm3-ink"
        >
          <X size={11} /> Remover arquivo
        </button>
      )}

      {erro && <p className="mt-1 text-xs text-pm3-descontinuado">{erro}</p>}
    </div>
  );
}
