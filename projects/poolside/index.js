const ADDRESSES = require('../helper/coreAssets.json')
const nullAddress = ADDRESSES.null
const { request, gql } = require("graphql-request");
const { sumTokens2 } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");

const graphQuery = gql`
query GET_PAIRS($block: Int) {
  pairs {
    id
    token0 {
      id
    }
    token1 {
      id
    }
  }
}
`;

const Token0Abi = "address:token0"
const Token1Abi = "address:token1"

const config = {
  ethereum: {
    graphUrl: 'https://api.thegraph.com/subgraphs/name/buttonwood-protocol/buttonswap',
  },
  avax: {
    graphUrl: 'https://api.thegraph.com/subgraphs/name/buttonwood-protocol/buttonswap-avalanche',
  },
  base: {
    graphUrl: 'https://api.thegraph.com/subgraphs/name/buttonwood-protocol/buttonswap-base-mainnet',
  }
}

async function tvl(chain, block) {
  const { graphUrl } = config[chain];
  const { pairs } = await request(
    graphUrl,
    graphQuery,
    {
      block,
    }
  );
  // Fetching all valid pairAddresses
  const pairAddresses = pairs.map(pair => pair.id).filter((pairAddress) => pairAddress != nullAddress);

  // Creating calls with each pairAddress as a target
  const calls = pairAddresses.map(i => ({ target: i }))

  // Multicall for fetching all of the token0s
  const { output: token0 } = await sdk.api.abi.multiCall({
    abi: Token0Abi,
    chain, block, calls,
  });

  // Multicall for fetching all of the token1s
  const { output: token1 } = await sdk.api.abi.multiCall({
    abi: Token1Abi,
    chain, block, calls,
  })

  // Combining token0s and token1s into one array
  const tokensAndOwners = [...token0, ...token1].map(({ output, input: { target }}) => [output, target, ]);

  // Fetching the balances of all of token0s and token1s in each pair and summing them
  return sumTokens2({ tokensAndOwners, chain, block, })
}

module.exports = {
  methodology:
    "TVL is the sum of all balances stored within the liquidity pools of Poolside. Data fetched from on-chain.",
};

// Iterating over each chain in config and exporting the tvl function for each
Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }, { api }) => tvl(chain, block),
  }
});
