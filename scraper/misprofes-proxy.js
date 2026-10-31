// Cloudflare Worker: proxy CORS solo para perfiles de costarica.misprofesores.com.
// Uso: GET https://<tu-worker>.workers.dev/?url=<URL-del-perfil-codificada>
const PERMITIDO = /^https:\/\/costarica\.misprofesores\.com\/profesores\/[^/?#]+$/;
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET', 'Vary': 'Origin' };

export default {
    async fetch(request) {
        if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
        const destino = new URL(request.url).searchParams.get('url') || '';
        if (!PERMITIDO.test(destino)) return new Response('URL no permitida', { status: 400, headers: CORS });

        const res = await fetch(destino, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TecPlanner/1.0)', 'Accept-Language': 'es' },
            cf: { cacheTtl: 60, cacheEverything: true }, // máx. 1 min de caché: datos casi en vivo
        });
        return new Response(res.body, {
            status: res.status,
            headers: { ...CORS, 'Content-Type': 'text/html; charset=utf-8' },
        });
    },
};
