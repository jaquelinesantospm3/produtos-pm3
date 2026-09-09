"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { Campo } from "@/components/campos";
import { salvarNomePerfil } from "@/actions/perfil";

export default function FormularioPerfil({ nome, email }: { nome: string; email: string }) {
  const router = useRouter();
  const [valor, setValor] = useState(nome);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState("");

  async function salvar() {
    setErro("");
    setSalvando(true);
    const resultado = await salvarNomePerfil(valor);
    setSalvando(false);

    if (!resultado.ok) {
      setErro(resultado.erro);
      return;
    }
    setSalvo(true);
    router.refresh();
    setTimeout(() => setSalvo(false), 2500);
  }

  return (
    <>
      <Campo rotulo="Seu nome" dica="Ex.: Camila Farinazzo">
        <input
          value={valor}
          onChange={(e) => {
            setValor(e.target.value);
            setSalvo(false);
          }}
          className="campo"
        />
      </Campo>

      <Campo rotulo="Seu e-mail" dica="Vem do login e não pode ser alterado aqui.">
        <input value={email} disabled className="campo bg-pm3-bg text-pm3-muted" />
      </Campo>

      {erro && (
        <p className="mb-3 flex items-start gap-2 rounded-lg bg-pm3-descontinuado-soft px-3 py-2 text-sm text-pm3-descontinuado">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          {erro}
        </p>
      )}

      <button
        type="button"
        onClick={salvar}
        disabled={salvando}
        className={`botao-primario ${salvo ? "!bg-pm3-ativo" : ""}`}
      >
        {salvando ? <Loader2 size={15} className="animate-spin" /> : salvo ? <Check size={15} /> : null}
        {salvando ? "Salvando..." : salvo ? "Salvo!" : "Salvar nome"}
      </button>
    </>
  );
}
