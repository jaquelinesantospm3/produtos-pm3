import FormularioProduto from "@/components/FormularioProduto";
import { listarProdutosResumidos, perfilAtual } from "@/lib/dados";

export const metadata = { title: "Cadastrar produto · Produtos PM3" };
export const dynamic = "force-dynamic";

export default async function PaginaNovoProduto() {
  const [disponiveis, perfil] = await Promise.all([listarProdutosResumidos(), perfilAtual()]);

  return <FormularioProduto disponiveis={disponiveis} nomeUsuario={perfil?.nome ?? ""} />;
}
