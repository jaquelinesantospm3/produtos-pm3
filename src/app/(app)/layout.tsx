import BarraTopo from "@/components/BarraTopo";
import AvisoModoTeste from "@/components/AvisoModoTeste";

export default function LayoutApp({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AvisoModoTeste />
      <BarraTopo />
      {children}
    </>
  );
}
