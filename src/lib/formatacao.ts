import { DIAS_ATE_REVISAO } from "@/lib/constantes";
import type { Status } from "@/lib/tipos";

export function formatarData(data: string | null | undefined): string {
  if (!data) return "—";
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export function diasDesde(data: string | null | undefined): number {
  if (!data) return 0;
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return 0;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export function precisaRevisao(atualizadoEm: string | null | undefined): boolean {
  return diasDesde(atualizadoEm) > DIAS_ATE_REVISAO;
}

/** Uma cor por status, usada no badge e na borda lateral do card. */
export const ESTILO_STATUS: Record<Status, { texto: string; fundo: string; ponto: string; borda: string }> = {
  Ativo: {
    texto: "text-pm3-ativo",
    fundo: "bg-pm3-ativo-soft",
    ponto: "bg-pm3-ativo",
    borda: "border-l-pm3-ativo",
  },
  "Em lançamento": {
    texto: "text-pm3-lancamento",
    fundo: "bg-pm3-lancamento-soft",
    ponto: "bg-pm3-lancamento",
    borda: "border-l-pm3-lancamento",
  },
  Pausado: {
    texto: "text-pm3-pausado",
    fundo: "bg-pm3-pausado-soft",
    ponto: "bg-pm3-pausado",
    borda: "border-l-pm3-pausado",
  },
  Descontinuado: {
    texto: "text-pm3-descontinuado",
    fundo: "bg-pm3-descontinuado-soft",
    ponto: "bg-pm3-descontinuado",
    borda: "border-l-pm3-descontinuado",
  },
};

/** Transforma "Sprint de Discovery com IA" em "sprint-de-discovery-com-ia". */
export function gerarSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
