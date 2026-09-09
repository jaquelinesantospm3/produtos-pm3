import FormularioProduto from "@/components/FormularioProduto";
import { listarProdutosResumidos } from "@/lib/dados";

export const metadata = { title: "Cadastrar produto · Produtos PM3" };
export const dynamic = "force-dynamic";

export default async function PaginaNovoProduto() {
  const disponiveis = await listarProdutosResumidos();
  return <FormularioProduto disponiveis={disponiveis} />;
}
