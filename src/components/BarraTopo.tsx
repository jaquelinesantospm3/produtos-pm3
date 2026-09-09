"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ClipboardList, LayoutGrid, LogOut, Wrench } from "lucide-react";

const ITENS = [
  { href: "/", rotulo: "Catálogo", icone: LayoutGrid },
  { href: "/logs", rotulo: "Logs", icone: ClipboardList },
  { href: "/manutencao", rotulo: "Manutenção", icone: Wrench },
];

export default function BarraTopo({ nome, email }: { nome: string; email: string }) {
  const caminho = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

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

          <div className="relative ml-1">
            <button
              type="button"
              onClick={() => setMenuAberto((aberto) => !aberto)}
              aria-label="Sua conta"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-pm3-ink text-xs font-semibold text-white"
            >
              {iniciais(nome)}
            </button>

            {menuAberto && (
              <>
                <button
                  type="button"
                  aria-hidden
                  tabIndex={-1}
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setMenuAberto(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-60 rounded-xl border border-pm3-line bg-pm3-surface p-2 shadow-lg">
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-medium text-pm3-ink">{nome}</p>
                    <p className="truncate text-xs text-pm3-faint">{email}</p>
                  </div>
                  <Link
                    href="/perfil"
                    onClick={() => setMenuAberto(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-pm3-ink hover:bg-pm3-bg"
                  >
                    Editar meu nome
                  </Link>
                  <form action="/auth/sair" method="post">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-pm3-ink hover:bg-pm3-bg"
                    >
                      <LogOut size={14} /> Sair
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}
