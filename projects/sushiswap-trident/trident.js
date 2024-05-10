const { blockQuery } = require('../helper/http')

const graphUrls = {
  polygon: "https://api.thegraph.com/subgraphs/name/sushi-v2/trident-polygon",
  polygonOldRouter:
    "https://api.thegraph.com/subgraphs/name/sushi-0m/trident-polygon",
  optimism: "https://api.thegraph.com/subgraphs/name/sushi-v2/trident-optimism",
  kava: "https://pvt.graph.kava.io/subgraphs/name/sushi-v2/trident-kava",
  metis:
    "https://andromeda.thegraph.metis.io/subgraphs/name/sushi-v2/trident-metis",
  bittorrent:
    "https://subgraphs.sushi.com/subgraphs/name/sushi-v2/trident-bttc",
  arbitrum: "https://api.thegraph.com/subgraphs/name/sushi-v2/trident-arbitrum",
  bsc: "https://api.thegraph.com/subgraphs/name/sushi-v2/trident-bsc",
  avax: "https://api.thegraph.com/subgraphs/name/sushi-v2/trident-avalanche",
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
