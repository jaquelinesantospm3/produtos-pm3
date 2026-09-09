import ListaCatalogo from "@/app/(app)/ListaCatalogo";
import { listarProdutos } from "@/lib/dados";

export const metadata = { title: "Catálogo · Produtos PM3" };
export const dynamic = "force-dynamic";

export default async function PaginaCatalogo() {
  const produtos = await listarProdutos();
  return <ListaCatalogo produtos={produtos} />;
}
