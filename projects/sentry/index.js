const { request, gql } = require("graphql-request");
const { sumTokens2 } = require("../helper/unwrapLPs");

const SUBGRAPH =
  "https://api.goldsky.com/api/public/project_cmm7vh5xwsa8m01qmdr7w7u62/subgraphs/tsunami-v3/2.4.0/gn";

async function tvl(api) {
  const pageSize = 1000;
  let lastId = "";
  const ownerTokens = [];

  while (true) {
    const query = gql`
      query sentryPools($lastId: ID!, $first: Int!) {
        pools(
          first: $first
          where: { isSentry: true, id_gt: $lastId }
          orderBy: id
          orderDirection: asc
        ) {
          id
          token0 { id }
          token1 { id }
        }
      }
    `;
    const { pools } = await request(SUBGRAPH, query, { lastId, first: pageSize });
    if (pools.length === 0) break;
    for (const p of pools) {
      ownerTokens.push([[p.token0.id, p.token1.id], p.id]);
    }
    if (pools.length < pageSize) break;
    lastId = pools[pools.length - 1].id;
  }

  return sumTokens2({ api, ownerTokens });
}

module.exports = {
  methodology:
    "TVL is the sum of token balances locked in Tsunami V3 pools created by the Sentry Launch Factory on Ink (chain ID 57073). Pools are filtered via Pool.isSentry == true in the Tsunami V3 subgraph, which covers both the V4 factory (0xDc37e11B68052d1539fa23386eE58Ac444bf5BE1) and the legacy agent factory (0x733733E8eAbB94832847AbF0E0EeD6031c3EB2E4). Tokens without DefiLlama pricing contribute 0, so reported USD TVL is dominated by the WETH/USDT0 side of each pool.",
  ink: { tvl },
};
