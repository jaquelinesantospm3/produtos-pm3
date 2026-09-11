import { NextResponse, type NextRequest } from "next/server";
import { arquivos } from "@/lib/banco";

/**
 * Recebe o PDF do formulário e guarda no bucket do R2.
 *
 * Antes o navegador mandava o arquivo direto para o storage, o que exigia
 * uma chave pública na página. Agora o arquivo passa pelo Worker: nenhuma
 * credencial sai daqui, e quem não passou pelo Access nem chega nesta rota.
 *
 * A resposta devolve o caminho do objeto; o formulário só guarda essa
 * referência, e a gravação no banco acontece quando o produto é salvo.
 */

const TAMANHO_MAXIMO_MB = 20;

export async function POST(request: NextRequest) {
  const formulario = await request.formData();
  const arquivo = formulario.get("arquivo");

  if (!(arquivo instanceof File)) {
    return NextResponse.json({ erro: "Nenhum arquivo foi enviado." }, { status: 400 });
  }

  const ehPdf = arquivo.type === "application/pdf" || arquivo.name.toLowerCase().endsWith(".pdf");
  if (!ehPdf) {
    return NextResponse.json({ erro: "O arquivo precisa ser um PDF." }, { status: 400 });
  }

  if (arquivo.size > TAMANHO_MAXIMO_MB * 1024 * 1024) {
    return NextResponse.json(
      { erro: `O arquivo é muito grande. O limite é ${TAMANHO_MAXIMO_MB} MB.` },
      { status: 413 },
    );
  }

  // Cada envio vai para uma pasta própria, então dois produtos podem ter
  // arquivos de mesmo nome sem um sobrescrever o outro.
  const nomeLimpo = arquivo.name.replace(/[^\w.\-]+/g, "-");
  const caminho = `${crypto.randomUUID()}/${nomeLimpo}`;

  try {
    const bucket = await arquivos();
    await bucket.put(caminho, arquivo.stream(), {
      httpMetadata: { contentType: "application/pdf" },
    });
  } catch {
    return NextResponse.json(
      { erro: "Não conseguimos enviar o arquivo agora. Tente de novo em alguns segundos." },
      { status: 500 },
    );
  }

  return NextResponse.json({ pdf_nome: arquivo.name, pdf_path: caminho });
}
