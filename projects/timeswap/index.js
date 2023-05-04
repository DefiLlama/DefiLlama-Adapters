const { request, gql } = require("graphql-request");
const { sumTokens2 } = require('../helper/unwrapLPs')

const GRAPH_URLS = {
  polygon:
    "https://api.thegraph.com/subgraphs/name/timeswap-labs/timeswap-defi-llama",
};

function chainTvl(chain) {
  return async (timestamp, _ethBlock, chainBlocks, { api }) => {
    const query = gql`
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
      await request(GRAPH_URLS[chain], query)
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
