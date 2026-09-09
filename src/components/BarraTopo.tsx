"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, LayoutGrid, Wrench } from "lucide-react";

const ITENS = [
  { href: "/", rotulo: "Catálogo", icone: LayoutGrid },
  { href: "/logs", rotulo: "Logs", icone: ClipboardList },
  { href: "/manutencao", rotulo: "Manutenção", icone: Wrench },
];

export default function BarraTopo() {
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
        </div>
      </div>
    </header>
  );
}
