"use server";

import { revalidatePath } from "next/cache";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { Resultado } from "@/lib/tipos";

/**
 * Ajusta o nome que assina as alterações. O e-mail vem do login e não muda.
 */
export async function salvarNomePerfil(nome: string): Promise<Resultado> {
  const limpo = nome.trim();
  if (limpo.length < 2) return { ok: false, erro: "Escreva seu nome completo." };

  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, erro: "Sua sessão expirou. Entre de novo." };

  const { error } = await supabase
    .from("perfis")
    .update({ nome: limpo, atualizado_em: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return { ok: false, erro: "Não conseguimos salvar seu nome agora. Tente de novo." };

  revalidatePath("/", "layout");
  return { ok: true, mensagem: "Nome atualizado." };
}
