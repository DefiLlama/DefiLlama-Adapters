const { graphQuery } = require("../helper/http");

const endpoint = "https://api.defiedge.io/graphql";

const query = /* GraphQL */ `
  query Stats($network: [Network!]) {
    stats(network: $network) {
      totalValueManaged
    }
  }
`;

async function getTvl(api) {
  const { network } = config[api.chain];

  const results = await graphQuery(endpoint, query, { network: [network] });
  const tvl = results.stats.totalValueManaged;

  return { "usd-coin": tvl };
}

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
  timetravel: false,
};

const config = {
  arbitrum: { network: "arbitrum" },
  avax: { network: "avalanche" },
  base: { network: "base" },
  bsc: { network: "bsc" },
  era: { network: "zksyncEra" },
  ethereum: { network: "mainnet" },
  optimism: { network: "optimism" },
  polygon_zkevm: { network: "zkEVM" },
  polygon: { network: "polygon" },
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl: getTvl };
});
