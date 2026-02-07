/**
 * CurrentX (Uniswap V3 fork) on MegaETH
 * TVL = sum of Token.totalValueLocked across all tokens
 * Source: Goldsky subgraph
 */
const { graphQuery } = require("../helper/http");
const { parseUnits } = require("ethers");

const GRAPHQL_URL =
  process.env.CURRENTX_GRAPHQL_URL ??
  "https://api.goldsky.com/api/public/project_cmlbj5xkhtfha01z0caladt37/subgraphs/currentx-v3/1.0.0/gn";

const PAGE_SIZE = 1000;

async function fetchAllTokens() {
  const out = [];
  let skip = 0;

  while (true) {
    const query = `
      {
        tokens(first: ${PAGE_SIZE}, skip: ${skip}, orderBy: id, orderDirection: asc) {
          id
          decimals
          totalValueLocked
        }
      }
    `;

    const data = await graphQuery(GRAPHQL_URL, query);
    const rows = data?.tokens ?? [];
    out.push(...rows);

    if (rows.length < PAGE_SIZE) break;
    skip += PAGE_SIZE;
  }

  return out;
}

async function tvl(api) {
  const tokens = await fetchAllTokens();

  for (const t of tokens) {
    if (!t?.id || t?.decimals == null || !t?.totalValueLocked) continue;

    try {
      const decimals = Number(t.decimals);
      const amt = parseUnits(t.totalValueLocked, decimals);
      if (amt > 0n) api.add(t.id, amt);
    } catch {
      // ignore bad decimals / scientific notation strings
    }
  }
}

module.exports = {
  megaeth: { tvl },
};
