const sdk = require("@defillama/sdk");
const { blockQuery } = require('../helper/http')

const graphUrls = {
  polygon: "https://api.thegraph.com/subgraphs/name/sushi-v2/trident-polygon",
  polygonOldRouter:
    sdk.graph.modifyEndpoint('5LBvcUQthQDZTMe6cyJ7DbeokFkYeVpYYBZruHPUjMG5'),
  optimism: sdk.graph.modifyEndpoint('FEgRuH9zeTRMZgpVv5YavoFEcisoK6KHk3zgQRRBqt51'),
  kava: "https://pvt.graph.kava.io/subgraphs/name/sushi-v2/trident-kava",
  metis:
    "https://andromeda.thegraph.metis.io/subgraphs/name/sushi-v2/trident-metis",
  bittorrent:
    "https://subgraphs.sushi.com/subgraphs/name/sushi-v2/trident-bttc",
  arbitrum: sdk.graph.modifyEndpoint('4x8H6ZoGfJykyZqAe2Kx2g5afsp17S9pn8GroRkpezhx'),
  bsc: sdk.graph.modifyEndpoint('9TQaBw1sU3wi2kdevuygKhfhjP3STnwBe1jUnKxmNhmn'),
  avax: sdk.graph.modifyEndpoint('NNTV3MgqSGtHMBGdMVLXzzDbKDKmsY87k3PsQ2knmC1'),
};

const tridentQueryWithBlock = `
  query get_tokens($block: Int) {
    tokens(
      block: { number: $block }
      first: 100
      orderBy: liquidityUSD
      orderDirection: desc
      where: { liquidityUSD_gt: 0 }
    ) {
      id
      symbol
      liquidity
    }
  }
`;

const tridentQuery = `
  query get_tokens {
    tokens(
      first: 100
      orderBy: liquidityUSD
      orderDirection: desc
      where: { liquidityUSD_gt: 0 }
    ) {
      id
      symbol
      liquidity
    }
  }
`;

function trident(chain) {
  return async (api) => {
    const graphUrl = graphUrls[chain];
    // Query graphql endpoint
    let result;
    result = await blockQuery(graphUrl, tridentQueryWithBlock, { api });

    if (chain == "polygon") {
      //add pools that haven't been migrated to the new router
      result.tokens.push(
        ...(await blockQuery(graphUrls["polygonOldRouter"], tridentQuery, { api })).tokens
      );
    }

    result.tokens.forEach((token) => {
      api.add(token.id, token.liquidity);
    });
    return api.getBalances()
  };
}

module.exports = {
  trident,
  methodology: `TVL of Trident consist of tokens deployed into swapping pairs.`,
};
