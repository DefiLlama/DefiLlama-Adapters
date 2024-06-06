const { sumTokens2 } = require('../helper/unwrapLPs')
const { cachedGraphQuery } = require('../helper/cache')

const GRAPH_URLS = {
  polygon:
    "https://api.thegraph.com/subgraphs/name/timeswap-labs/timeswap-defi-llama",
};

function chainTvl(chain) {
  return async (api) => {
    const query = `
      {
        pairs {
          id
          asset {
            id
          }
          collateral {
            id
          }
        }
      }
    `;

    const pairs = (
      await cachedGraphQuery('timeswap/'+api.chain, GRAPH_URLS[chain], query)
    ).pairs.map((pair) => ({
      address: pair.id,
      asset: pair.asset.id,
      collateral: pair.collateral.id,
    }));

    const ownerTokens = [];

    for (const pair of pairs)
    ownerTokens.push([[pair.asset, pair.collateral], pair.address])
    return sumTokens2({ api, ownerTokens})
  };
}

module.exports = {
  misrepresentedTokens: true,
  polygon: {
    tvl: chainTvl("polygon"),
  },
};
