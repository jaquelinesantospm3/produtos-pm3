import PainelManutencao from "@/app/(app)/manutencao/PainelManutencao";
import { listarProdutos } from "@/lib/dados";

export const metadata = { title: "Manutenção · Produtos PM3" };
export const dynamic = "force-dynamic";

export default async function PaginaManutencao() {
  const produtos = await listarProdutos();
  return <PainelManutencao produtos={produtos} />;
}
