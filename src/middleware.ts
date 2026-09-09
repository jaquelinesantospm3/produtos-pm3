import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DOMINIO_PERMITIDO } from "@/lib/constantes";

type CookieParaGravar = { name: string; value: string; options: CookieOptions };

const ROTAS_PUBLICAS = ["/login", "/auth"];

/**
 * Renova a sessão a cada navegação e protege todas as telas:
 * sem login vai para /login; logado com e-mail fora do domínio é
 * desconectado na hora (a checagem não fica só no formulário de login).
 */
export async function middleware(request: NextRequest) {
  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesParaGravar: CookieParaGravar[]) {
          cookiesParaGravar.forEach(({ name, value }) => request.cookies.set(name, value));
          resposta = NextResponse.next({ request });
          cookiesParaGravar.forEach(({ name, value, options }) =>
            resposta.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Se o Supabase estiver fora do ar, tratamos como "ninguém logado":
  // a pessoa cai na tela de login em vez de ver um erro técnico.
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    user = null;
  }

  const caminho = request.nextUrl.pathname;
  const rotaPublica = ROTAS_PUBLICAS.some((rota) => caminho.startsWith(rota));

  if (user && !user.email?.toLowerCase().endsWith(DOMINIO_PERMITIDO)) {
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "?erro=dominio";
    return NextResponse.redirect(url);
  }

  if (!user && !rotaPublica) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = caminho === "/" ? "" : `?destino=${encodeURIComponent(caminho)}`;
    return NextResponse.redirect(url);
  }

  if (user && caminho === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return resposta;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
