import { notFound } from "next/navigation";
import FormularioProduto from "@/components/FormularioProduto";
import { buscarProduto, listarProdutosResumidos, perfilAtual } from "@/lib/dados";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const produto = await buscarProduto(slug);
  return { title: produto ? `Editar ${produto.nome_oficial} · Produtos PM3` : "Editar produto" };
}

export default async function PaginaEditarProduto({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [produto, disponiveis, perfil] = await Promise.all([
    buscarProduto(slug),
    listarProdutosResumidos(),
    perfilAtual(),
  ]);

  if (!produto) notFound();

  return (
    <FormularioProduto
      produto={produto}
      disponiveis={disponiveis}
      nomeUsuario={perfil?.nome ?? ""}
    />
  );
}
