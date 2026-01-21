/**
 * PagCrypto - DefiLlama Volume + Fees Adapter
 *
 * PagCrypto não tem TVL/escrow; o que listamos é:
 * - Volume (TTV) por chain
 * - Fees por chain
 *
 * Fonte: endpoints do seu BFF (Fastify):
 * - GET /defillama/volume?chain=<chain>&timestamp=<unix>
 * - GET /defillama/fees?chain=<chain>&timestamp=<unix>
 */

const config = require("./config");

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

function normalizeTimestamp(ts) {
  const n = Number(ts);
  if (!Number.isFinite(n) || n <= 0) return Math.floor(Date.now() / 1000);
  return Math.floor(n);
}

function getChain(chain) {
  const c = config.chains?.[chain];
  if (!c) return null;
  return c;
}

function buildUrl(path, chain, timestamp) {
  const base = config.api.baseUrl.replace(/\/$/, "");
  return `${base}${path}?chain=${encodeURIComponent(chain)}&timestamp=${encodeURIComponent(
      String(timestamp)
  )}`;
}

/**
 * DefiLlama Volume adapter shape:
 * module.exports = {
 *   <chain>: { fetch: async (timestamp) => ({ dailyVolume: "..." }), start: async () => <unix> },
 *   ...
 * }
 *
 * Fees adapters podem usar "dailyFees"/"dailyRevenue" (ou variantes).
 * Aqui expomos:
 * - <chain>.fetch => dailyVolume
 * - <chain>.fees  => dailyFees + dailyRevenue
 */
function makeVolumeFetcher(chain) {
  return async (timestamp) => {
    const chainCfg = getChain(chain);
    const ts = normalizeTimestamp(timestamp);

    // se chain está "soon", retorna 0
    if (chainCfg?.status === "soon") return { dailyVolume: "0" };

    const url = buildUrl(config.api.endpoints.volume, chain, ts);
    const data = await fetchJson(url);

    // compat: garantir string
    const dailyVolume = data?.dailyVolume ?? "0";
    return { dailyVolume: String(dailyVolume) };
  };
}

function makeFeesFetcher(chain) {
  return async (timestamp) => {
    const chainCfg = getChain(chain);
    const ts = normalizeTimestamp(timestamp);

    if (chainCfg?.status === "soon") return { dailyFees: "0", dailyRevenue: "0" };

    const url = buildUrl(config.api.endpoints.fees, chain, ts);
    const data = await fetchJson(url);

    const dailyFees = data?.dailyFees ?? "0";
    const dailyRevenue = data?.dailyRevenue ?? "0";
    return { dailyFees: String(dailyFees), dailyRevenue: String(dailyRevenue) };
  };
}

const adapter = {};

Object.keys(config.chains).forEach((chain) => {
  adapter[chain] = {
    // volume
    fetch: makeVolumeFetcher(chain),

    // fees (campo extra; dependendo do dashboard, pode ser um adapter separado)
    fees: makeFeesFetcher(chain),

    // start: ideal é colocar o primeiro dia que vocês têm dados reais
    // (por enquanto 0, depois você ajusta para o timestamp do primeiro dia)
    start: async () => 0,
  };
});

module.exports = adapter;
