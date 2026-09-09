import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieParaGravar = { name: string; value: string; options: CookieOptions };

/**
 * Cliente do Supabase para uso no servidor (Server Components e Server Actions).
 * Todas as consultas passam pelas políticas de RLS: quem não é @pm3.com.br
 * simplesmente não recebe dado nenhum.
 */
export async function criarClienteServidor() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesParaGravar: CookieParaGravar[]) {
          try {
            cookiesParaGravar.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component não pode gravar cookie: o middleware já cuida
            // de renovar a sessão a cada navegação.
          }
        },
      },
    },
  );
}
