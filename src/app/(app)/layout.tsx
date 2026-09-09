import { redirect } from "next/navigation";
import BarraTopo from "@/components/BarraTopo";
import { perfilAtual } from "@/lib/dados";

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const perfil = await perfilAtual();
  if (!perfil) redirect("/login");

  return (
    <>
      <BarraTopo nome={perfil.nome} email={perfil.email} />
      {children}
    </>
  );
}
