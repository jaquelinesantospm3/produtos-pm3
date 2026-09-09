import type { Categoria, Status } from "@/lib/tipos";

export const CATEGORIAS: Categoria[] = [
  "Formação",
  "Membership",
  "Sprint",
  "Pós",
  "Stack",
  "Curso",
  "Evento",
  "In-Company",
  "Outro",
];

export const STATUS: Status[] = ["Ativo", "Em lançamento", "Pausado", "Descontinuado"];

export const TIMES = [
  "Time Cursos",
  "Time Eventos",
  "Time Campanhas",
  "Time Comunidade",
  "PMM",
  "Outro",
];

/** Só e-mails deste domínio entram. A mesma regra vale no banco (RLS). */
export const DOMINIO_PERMITIDO = "@pm3.com.br";

/** A partir de quantos dias sem atualização o produto é marcado para revisão. */
export const DIAS_ATE_REVISAO = 90;

export const BUCKET_PDF = "produtos-pdf";
