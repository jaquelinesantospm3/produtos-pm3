import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Adaptador que empacota o Next.js para rodar dentro de um Worker.
 * Sem cache incremental configurado: as páginas são renderizadas a cada
 * visita, o que é o certo para um catálogo que muda o tempo todo.
 */
export default defineCloudflareConfig();
