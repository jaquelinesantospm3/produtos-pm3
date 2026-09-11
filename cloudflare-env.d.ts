/**
 * Bindings do Worker, declarados em wrangler.jsonc.
 *
 * Este arquivo é versionado para o projeto compilar em qualquer máquina.
 * Depois de mexer nos bindings, regenere com:  npm run tipos
 */
interface CloudflareEnv {
  /** Banco de dados do catálogo (Cloudflare D1). */
  DB: D1Database;
  /** Bucket com os PDFs dos produtos (Cloudflare R2). */
  PDF_BUCKET: R2Bucket;
  /** Arquivos estáticos do Next.js, servidos pelo próprio Worker. */
  ASSETS: Fetcher;
}
