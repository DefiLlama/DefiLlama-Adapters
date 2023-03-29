const { request, gql } = require("graphql-request");
const { getUniqueAddresses } = require('../helper/utils')
const { sumTokens2 } = require("../helper/unwrapLPs");

const addresses = {
  astar: {
    seanStaking: "0xa86dc743efBc24AF4c1FC5d150AaDb4DCF52c868",
    seanToken: "0xEe8138B3bd03905cF84aFE10cCD0dCcb820eE08E",
    liquidity: "0x496F6125E1cd31f268032bd4cfaA121D203639b7",
    farm: "0x8e04fbEb4049FD855Cc4aF36A8b198dC7C0e31D0",
  },
};

const urls = {
  astar: {
    liquidityGraph:
      "https://api.subquery.network/sq/Starfish-Finance/starfish-finance-v3",
    framGraph:
      "https://api.subquery.network/sq/Starfish-Finance/starfish-finance-farm",
    api: "https://api2.starfish.finance",
  },
};

const liquidityAddressQuery = gql`
  {
    pools(first: 1000) {
      nodes {
        tokens(orderBy: ID_ASC) {
          nodes {
            address
          }
        }
      }
    }
  }
`;

const getLiquidityTokenAddresses = async (chain) => {
  const response = await request(
    urls[chain].liquidityGraph,
    liquidityAddressQuery
  );

  let tokenAddresses = [];
  for (let i = 0; i < response.pools.nodes.length; i++) {
    for (let address of response.pools.nodes[i].tokens.nodes) {
      tokenAddresses.push(address.address);
    }
  }
  return getUniqueAddresses(tokenAddresses)
};

const getLiquidityTvl = async (api) => {
  const tokenAddresses = await getLiquidityTokenAddresses(api.chain);
  return sumTokens2({ api, tokens: tokenAddresses, owner: addresses[api.chain].liquidity})
};

module.exports = { getLiquidityTvl, addresses };
