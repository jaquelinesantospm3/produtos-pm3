import FormularioLogin from "@/app/login/FormularioLogin";

export const metadata = { title: "Entrar · Produtos PM3" };

export default async function PaginaLogin({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; destino?: string }>;
}) {
  const { erro, destino } = await searchParams;

  const mensagemDeErro =
    erro === "dominio"
      ? "Esse e-mail não é da PM3. O acesso é restrito a e-mails terminados em @pm3.com.br."
      : erro === "link"
        ? "Esse link de acesso expirou ou já foi usado. Peça um novo link abaixo."
        : "";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-pm3-ink">Produtos PM3</h1>
        <p className="mt-1 text-sm text-pm3-muted">
          A fonte única da verdade sobre cada produto da PM3.
        </p>
      </div>

      <div className="rounded-xl border border-pm3-line bg-pm3-surface p-6">
        <h2 className="font-serif text-xl text-pm3-ink">Entrar</h2>
        <p className="mb-5 mt-1 text-sm text-pm3-muted">
          Digite seu e-mail da PM3. Enviamos um link de acesso — não precisa de senha.
        </p>
        <FormularioLogin erroInicial={mensagemDeErro} destino={destino ?? "/"} />
      </div>

      <p className="mt-6 text-xs text-pm3-faint">
        O acesso é restrito a pessoas com e-mail @pm3.com.br.
      </p>
    </main>
  );
}
