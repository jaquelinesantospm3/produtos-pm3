import { ESTILO_STATUS } from "@/lib/formatacao";
import type { Status } from "@/lib/tipos";

export default function SeloStatus({ status }: { status: Status }) {
  const estilo = ESTILO_STATUS[status] ?? ESTILO_STATUS.Pausado;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${estilo.fundo} ${estilo.texto}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${estilo.ponto}`} />
      {status}
    </span>
  );
}
