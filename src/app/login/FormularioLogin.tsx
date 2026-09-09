"use client";

import { useState } from "react";
import { AlertTriangle, Check, Loader2, Mail } from "lucide-react";
import { criarClienteNavegador } from "@/lib/supabase/navegador";
import { DOMINIO_PERMITIDO } from "@/lib/constantes";

export default function FormularioLogin({
  erroInicial,
  destino,
}: {
  erroInicial: string;
  destino: string;
}) {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState(erroInicial);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro("");

    const limpo = email.trim().toLowerCase();

    if (!limpo) {
      setErro("Escreva seu e-mail para continuar.");
      return;
    }
    // Primeira barreira. A segunda está no banco de dados, que recusa
    // qualquer conta fora do domínio mesmo sem passar por esta tela.
    if (!limpo.endsWith(DOMINIO_PERMITIDO)) {
      setErro(
        `Esse e-mail não é da PM3. O acesso é restrito a e-mails terminados em ${DOMINIO_PERMITIDO}.`,
      );
      return;
    }

    setEnviando(true);
    const supabase = criarClienteNavegador();
    const { error } = await supabase.auth.signInWithOtp({
      email: limpo,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?destino=${encodeURIComponent(destino)}`,
      },
    });
    setEnviando(false);

    if (error) {
      setErro(
        error.message.toLowerCase().includes("restrito")
          ? `O acesso é restrito a e-mails terminados em ${DOMINIO_PERMITIDO}.`
          : "Não conseguimos enviar o link agora. Tente de novo em alguns segundos.",
      );
      return;
    }

    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="rounded-lg bg-pm3-ativo-soft p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-pm3-ativo">
          <Check size={16} /> Link enviado para {email.trim().toLowerCase()}
        </p>
        <p className="mt-2 text-sm text-pm3-muted">
          Abra seu e-mail e clique no link para entrar. Ele vale por uma hora e só funciona uma vez.
        </p>
        <button
          type="button"
          onClick={() => {
            setEnviado(false);
            setEmail("");
          }}
          className="mt-3 text-xs font-medium text-pm3-accent-ink underline"
        >
          Usar outro e-mail
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate>
      <label className="mb-1 block text-sm font-medium text-pm3-ink" htmlFor="email">
        Seu e-mail da PM3
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={`voce${DOMINIO_PERMITIDO}`}
        autoComplete="email"
        className="campo"
      />
      <p className="mt-1 text-xs text-pm3-faint">Ex.: maria.silva{DOMINIO_PERMITIDO}</p>

      {erro && (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-pm3-descontinuado-soft px-3 py-2 text-sm text-pm3-descontinuado">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          {erro}
        </p>
      )}

      <button type="submit" disabled={enviando} className="botao-primario mt-4 w-full">
        {enviando ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
        {enviando ? "Enviando..." : "Receber link de acesso"}
      </button>
    </form>
  );
}
