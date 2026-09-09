/**
 * Faixa que lembra que o sistema está sem login.
 * Quando o login voltar, é só apagar este componente e a linha que o usa
 * em src/app/(app)/layout.tsx.
 */
export default function AvisoModoTeste() {
  return (
    <div className="sem-impressao bg-pm3-lancamento-soft px-5 py-1.5 text-center text-xs text-pm3-lancamento">
      Modo de teste: sem login. Qualquer pessoa com o link vê e edita os produtos, e as
      alterações ficam registradas como &ldquo;Modo de teste&rdquo;.
    </div>
  );
}
