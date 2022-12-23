const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const { getChainTransform } = require("../helper/portedTokens");

const graphUrls = {
  polygon: "https://api.thegraph.com/subgraphs/name/sushi-qa/trident-polygon",
  optimism: "https://api.thegraph.com/subgraphs/name/sushi-qa/trident-optimism",
  kava: "https://pvt.graph.kava.io/subgraphs/name/sushi-qa/trident-kava",
  metis:
    "https://andromeda.thegraph.metis.io/subgraphs/name/sushi-qa/trident-metis",
};

const tridentQueryWithBlock = gql`
  query get_tokens($block: Int) {
    tokens(
      block: { number: $block }
      first: 1000
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

const tridentQuery = gql`
  query get_tokens {
    tokens(
      first: 1000
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
  return async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
    const graphUrl = graphUrls[chain];
    const block = chainBlocks[chain];
    const transform = await getChainTransform(chain);

    // Query graphql endpoint
    let result;
    if (block) {
      result = await request(graphUrl, tridentQueryWithBlock, {
        block: block - 50, //subgraphs can be late by few seconds/minutes
      });
    } else {
      result = await request(graphUrl, tridentQuery);
    }

    result.tokens.forEach((token) => {
      sdk.util.sumSingleBalance(balances, transform(token.id), token.liquidity);
    });

    return balances;
  };
}

module.exports = {
  trident,
  methodology: `TVL of Trident consist of tokens deployed into swapping pairs.`,
};
