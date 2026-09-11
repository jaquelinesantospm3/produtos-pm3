import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** @type {import('next').NextConfig} */
const nextConfig = {};

// Faz o `next dev` enxergar os bindings do Worker (D1 e R2) do wrangler.jsonc.
initOpenNextCloudflareForDev();

export default nextConfig;
