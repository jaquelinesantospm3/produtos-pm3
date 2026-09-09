import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FormularioPerfil from "@/app/(app)/perfil/FormularioPerfil";
import { perfilAtual } from "@/lib/dados";

export const metadata = { title: "Meu perfil · Produtos PM3" };
export const dynamic = "force-dynamic";

export default async function PaginaPerfil() {
  const perfil = await perfilAtual();
  if (!perfil) redirect("/login");

  return (
    <main className="mx-auto max-w-lg px-5 py-8 sm:px-8">
      <Link href="/" className="mb-6 flex items-center gap-1.5 text-sm text-pm3-muted">
        <ArrowLeft size={15} /> Catálogo
      </Link>

      <h1 className="mb-1 font-serif text-2xl text-pm3-ink">Meu perfil</h1>
      <p className="mb-6 text-sm text-pm3-muted">
        Este é o nome que aparece nos registros de alteração que você fizer.
      </p>

      <div className="rounded-xl border border-pm3-line bg-pm3-surface p-6">
        <FormularioPerfil nome={perfil.nome} email={perfil.email} />
      </div>
    </main>
  );
}
