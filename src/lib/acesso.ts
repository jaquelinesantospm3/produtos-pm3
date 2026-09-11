import "server-only";
import { headers } from "next/headers";

/**
 * Quem está usando o sistema.
 *
 * Não existe tela de login: o Cloudflare Access barra quem não é da PM3
 * antes da requisição chegar aqui. Quando a pessoa passa, o Access anexa
 * a identidade dela nos cabeçalhos, e é isso que lemos abaixo.
 *
 * Como este Worker só é alcançável através do Access, o cabeçalho já vem
 * verificado. Se um dia o Worker ficar exposto por outro caminho (um
 * domínio sem política do Access, por exemplo), a validação da assinatura
 * do Cf-Access-Jwt-Assertion passa a ser obrigatória.
 */

const DOMINIO_PM3 = "@pm3.com.br";

export type Autor = { nome: string; email: string };

/** "thelson.fernandes@pm3.com.br" vira "Thelson Fernandes". */
export function nomeAPartirDoEmail(email: string): string {
  const usuario = email.split("@")[0] ?? "";
  return usuario
    .replace(/[._]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase())
    .join(" ");
}

/** Lê o nome da pessoa dentro do token do Access, quando o provedor manda. */
function nomeNoToken(token: string | null): string {
  if (!token) return "";
  try {
    const corpo = token.split(".")[1];
    if (!corpo) return "";
    const json = atob(corpo.replace(/-/g, "+").replace(/_/g, "/"));
    const dados = JSON.parse(json) as {
      name?: string;
      custom?: { name?: string; full_name?: string };
    };
    return (dados.custom?.name || dados.custom?.full_name || dados.name || "").trim();
  } catch {
    return "";
  }
}

/** Nome e e-mail de quem está fazendo a alteração. Nunca vem do formulário. */
export async function autorAtual(): Promise<Autor> {
  const cabecalhos = await headers();

  const email = (cabecalhos.get("cf-access-authenticated-user-email") ?? "").trim().toLowerCase();

  if (!email) {
    // Acontece no `next dev`, onde não há Access na frente.
    return { nome: "Ambiente local", email: "local@pm3.com.br" };
  }

  const nome = nomeNoToken(cabecalhos.get("cf-access-jwt-assertion")) || nomeAPartirDoEmail(email);
  return { nome, email };
}

/** Confere se a pessoa é da PM3. O Access já garante isso; aqui é rede de segurança. */
export function ehEmailPm3(email: string): boolean {
  return email.toLowerCase().endsWith(DOMINIO_PM3);
}
