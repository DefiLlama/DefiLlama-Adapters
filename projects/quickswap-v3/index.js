const { request, gql } = require("graphql-request");
const { getBlock } = require("../helper/getBlock");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { log } = require("../helper/utils");

const graphs = {
  polygon: "https://api.thegraph.com/subgraphs/name/sameepsi/quickswap-v3",
  dogechain:
    "https://api-dogechain.algebra.finance/subgraphs/name/quickswap/dogechain-info",
};

const blacklists = {
  polygon: [],
  dogechain: [],
};

function v3TvlPaged(chain) {
  return async (_, _b, { [chain]: block }) => {
    // block = await getBlock(_, chain, { [chain]: block });
    log("Fetching data for block: ", chain, block);
    const balances = {};
    const size = 1000;
    let lastId = "";
    let pools;
    const graphQueryPaged = gql`
    query poolQuery($lastId: String) {
      pools(first:${size} where: {id_gt: $lastId totalValueLockedUSD_gt: 100}) {
        id
        token0 { id }
        token1 { id }
      }
    }
  `; // remove the bad pools
    const blacklisted = blacklists[chain] || [];

    do {
      const res = await request(graphs[chain], graphQueryPaged, {
        lastId,
        // block: block - 500,
      });
      pools = res.pools;
      const tokensAndOwners = pools
        .map((i) => [
          [i.token0.id, i.id],
          [i.token1.id, i.id],
        ])
        .flat();
      log(chain, block, lastId, pools.length);
      await sumTokens2({
        balances,
        tokensAndOwners,
        chain,
        block,
        blacklistedTokens: blacklisted,
      });
      lastId = pools[pools.length - 1].id;
    } while (pools.length === size);

    return balances;
  };
}

module.exports = {
  timetravel: false,
};

const chains = ["polygon", "dogechain"];

chains.forEach((chain) => {
  module.exports[chain] = {
    tvl: v3TvlPaged(chain),
  };
});
