import { createBrowserClient } from "@supabase/ssr";

/** Cliente do Supabase para uso no navegador (login e upload de PDF). */
export function criarClienteNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
