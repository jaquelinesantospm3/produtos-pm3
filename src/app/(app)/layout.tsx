import BarraTopo from "@/components/BarraTopo";
import { autorAtual } from "@/lib/acesso";

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  // Quem está usando vem do Cloudflare Access, não de uma tela de login.
  const autor = await autorAtual();

  return (
    <>
      <BarraTopo nome={autor.nome} email={autor.email} />
      {children}
    </>
  );
}
