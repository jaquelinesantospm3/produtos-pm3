import { NextResponse, type NextRequest } from "next/server";
import { arquivos, banco } from "@/lib/banco";

/**
 * Entrega o PDF do produto.
 *
 * O bucket do R2 não é público: ninguém alcança o arquivo por fora. Quem
 * chega até aqui já passou pelo Cloudflare Access, então basta ler o
 * objeto e devolver. Não existe mais link temporário para expirar.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await banco();

  const produto = await db
    .prepare("select pdf_path, pdf_nome from produtos where slug = ?")
    .bind(slug)
    .first<{ pdf_path: string; pdf_nome: string }>();

  if (!produto?.pdf_path) {
    return new NextResponse("Este produto ainda não tem PDF cadastrado.", { status: 404 });
  }

  const bucket = await arquivos();
  const objeto = await bucket.get(produto.pdf_path);

  if (!objeto) {
    return new NextResponse("Não foi possível abrir o PDF agora. Tente de novo.", { status: 500 });
  }

  const nome = (produto.pdf_nome || `${slug}.pdf`).replace(/"/g, "");

  return new NextResponse(objeto.body as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${nome}"`,
      // Conteúdo restrito: nunca guardar em cache compartilhado.
      "Cache-Control": "private, no-store",
    },
  });
}
