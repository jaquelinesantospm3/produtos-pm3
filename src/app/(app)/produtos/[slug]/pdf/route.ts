import { NextResponse, type NextRequest } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { BUCKET_PDF } from "@/lib/constantes";

/**
 * O bucket de PDFs é privado. Aqui geramos um link temporário (5 minutos)
 * para quem está logado e redirecionamos direto para o arquivo.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await criarClienteServidor();

  const { data: produto } = await supabase
    .from("produtos")
    .select("pdf_path")
    .eq("slug", slug)
    .maybeSingle();

  if (!produto?.pdf_path) {
    return new NextResponse("Este produto ainda não tem PDF cadastrado.", { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from(BUCKET_PDF)
    .createSignedUrl(produto.pdf_path, 300);

  if (error || !data) {
    return new NextResponse("Não foi possível abrir o PDF agora. Tente de novo.", { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
