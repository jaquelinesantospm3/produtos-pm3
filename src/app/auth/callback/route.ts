import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { DOMINIO_PERMITIDO } from "@/lib/constantes";

/**
 * Ponto de chegada do link mágico enviado por e-mail.
 * Troca o código pela sessão e confere de novo o domínio antes de deixar entrar.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const tipo = searchParams.get("type") as EmailOtpType | null;
  const destino = searchParams.get("destino") || "/";

  const supabase = await criarClienteServidor();

  let erro = null;
  if (code) {
    ({ error: erro } = await supabase.auth.exchangeCodeForSession(code));
  } else if (tokenHash && tipo) {
    ({ error: erro } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo }));
  } else {
    erro = new Error("sem código");
  }

  if (erro) {
    return NextResponse.redirect(`${origin}/login?erro=link`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email?.toLowerCase().endsWith(DOMINIO_PERMITIDO)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?erro=dominio`);
  }

  return NextResponse.redirect(`${origin}${destino.startsWith("/") ? destino : "/"}`);
}
