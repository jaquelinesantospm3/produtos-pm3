"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, LayoutGrid, LogOut, Wrench } from "lucide-react";

const ITENS = [
  { href: "/", rotulo: "Catálogo", icone: LayoutGrid },
  { href: "/logs", rotulo: "Logs", icone: ClipboardList },
  { href: "/manutencao", rotulo: "Manutenção", icone: Wrench },
];

/** Endereço padrão de saída do Cloudflare Access. Encerra a sessão na borda. */
const SAIR = "/cdn-cgi/access/logout";

export default function BarraTopo({ nome, email }: { nome: string; email: string }) {
  const caminho = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-pm3-line bg-pm3-bg sem-impressao">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-lg font-semibold text-pm3-ink">Produtos PM3</span>
          <span className="hidden text-xs text-pm3-faint sm:inline">fonte única da verdade</span>
        </Link>

        <div className="flex items-center gap-1">
          {ITENS.map((item) => {
            const Icone = item.icone;
            const ativo = item.href === "/" ? caminho === "/" : caminho.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  ativo ? "bg-pm3-accent-soft text-pm3-accent-ink" : "text-pm3-muted hover:text-pm3-ink"
                }`}
              >
                <Icone size={15} />
                <span className="hidden sm:inline">{item.rotulo}</span>
              </Link>
            );
          })}

          <span className="mx-2 hidden h-5 w-px bg-pm3-line lg:inline-block" />

          <span className="hidden text-xs text-pm3-faint lg:inline" title={email}>
            {nome}
          </span>

          <a
            href={SAIR}
            title="Sair"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-pm3-muted transition-colors hover:text-pm3-ink"
          >
            <LogOut size={15} />
            <span className="sr-only">Sair</span>
          </a>
        </div>
      </div>
    </header>
  );
}
