import ListaLogs from "@/app/(app)/logs/ListaLogs";
import { listarAutores, listarLogs, listarProdutosResumidos } from "@/lib/dados";

export const metadata = { title: "Logs · Produtos PM3" };
export const dynamic = "force-dynamic";

export default async function PaginaLogs() {
  const [logs, produtos, autores] = await Promise.all([
    listarLogs(),
    listarProdutosResumidos(),
    listarAutores(),
  ]);

  return <ListaLogs logs={logs} produtos={produtos} autores={autores} />;
}
