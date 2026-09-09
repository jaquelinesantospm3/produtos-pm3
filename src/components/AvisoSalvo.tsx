"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check } from "lucide-react";

/** Confirmação visual depois de salvar (some sozinha em alguns segundos). */
export default function AvisoSalvo() {
  const parametros = useSearchParams();
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    if (parametros.get("salvo") === "1") {
      setVisivel(true);
      const relogio = setTimeout(() => setVisivel(false), 3200);
      return () => clearTimeout(relogio);
    }
  }, [parametros]);

  if (!visivel) return null;

  return (
    <div className="sem-impressao fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-pm3-ink px-4 py-2.5 text-sm font-medium text-white shadow-lg">
      <Check size={15} /> Alterações salvas. Este é o registro oficial do produto.
    </div>
  );
}
