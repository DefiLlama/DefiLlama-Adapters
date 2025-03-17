const { isStableToken } = require("./helper/streamingHelper");
const { getBlock } = require("./helper/http");
const { blockQuery } = require("./helper/http");

const supertokensQuery = `
query get_supertokens($block: Int) {
  tokens(
    first: 1000, 
    block: { number: $block } 
    where:{
     isSuperToken:true
   }
  ) {
    id
    underlyingAddress
    name
    underlyingToken {
      name
      decimals
      symbol
      id
    }
    symbol
    decimals
    isSuperToken
    isNativeAssetSuperToken
    isListed
  }
}
`;

function isWhitelistedToken(token, address, isVesting) {
  const isStable = isStableToken(token?.symbol, address);
  return isVesting ? !isStable : isStable;
}

const blacklistedSuperTokens = new Set(
  ["0x441bb79f2da0daf457bad3d401edb68535fb3faa"].map((i) => i.toLowerCase())
);

// Main function for all chains to get balances of superfluid tokens
async function getChainBalances(allTokens, chain, block, isVesting, api) {
  // Init empty balances
  let balances = {};

  allTokens = allTokens.filter(({ underlyingAddress, underlyingToken = {} }) =>
    isWhitelistedToken(underlyingToken, underlyingAddress, isVesting)
  );

  // Abi MultiCall to get supertokens supplies
  const supply = await api.multiCall({
    abi: "erc20:totalSupply", // abi['totalSupply'],
    calls: allTokens.map(token => token.id),
  });

  supply.forEach((totalSupply, i) => {
    const {
      id,
      underlyingAddress,
      underlyingToken,
      decimals,
      name,
      symbol,
      isNativeAssetSuperToken,
    } = allTokens[i];
    let underlyingTokenBalance =
      (totalSupply * 10 ** (underlyingToken || { decimals: 18 }).decimals) /
      10 ** decimals;
    // Accumulate to balances, the balance for tokens on mainnet or sidechain
    let prefixedUnderlyingAddress = underlyingAddress;
    // if (!underlyingToken && underlyingTokenBalance/1e24 > 1) sdk.log(name, symbol, chain, Math.floor(underlyingTokenBalance/1e24))
    // if (isNativeAssetSuperToken) prefixedUnderlyingAddress = chain + ':' + underlyingAddress
    if (
      !underlyingToken ||
      blacklistedSuperTokens.has(underlyingAddress.toLowerCase())
    )
      return;
    api.add(prefixedUnderlyingAddress, underlyingTokenBalance);
  });
}

async function retrieveSupertokensBalances(
  chain,
  block,
  isVesting,
  api,
  graphUrl
) {
  const blockNum = await getBlock(api.timestamp, chain, { [chain]: block });
  const { tokens } = await blockQuery(graphUrl, supertokensQuery, {
    api: { getBlock: () => blockNum, block: blockNum },
  });

  // Use active supertokens only
  const allTokens = tokens.filter((t) => t.isSuperToken && t.isListed);

  return getChainBalances(allTokens, chain, block, isVesting, api);
}

/**
 * List of subgraphs can be retrieved from https://docs.superfluid.finance/docs/technical-reference/subgraph
 */
const subgraphEndpoints = {
  arbitrum: {
    graph: "https://subgraph-endpoints.superfluid.dev/arbitrum-one/protocol-v1",
  },
  avax: {
    graph: "https://subgraph-endpoints.superfluid.dev/avalanche-c/protocol-v1",
  },
  base: {
    graph: "https://subgraph-endpoints.superfluid.dev/base-mainnet/protocol-v1",
  },
  bsc: {
    graph: "https://subgraph-endpoints.superfluid.dev/bsc-mainnet/protocol-v1",
  },
  // degen: {
  //   graph:
  //     "https://subgraph-endpoints.superfluid.dev/degenchain-mainnet/protocol-v1",
  // },
  ethereum: {
    graph: "https://subgraph-endpoints.superfluid.dev/eth-mainnet/protocol-v1",
  },
  optimism: {
    graph:
      "https://subgraph-endpoints.superfluid.dev/optimism-mainnet/protocol-v1",
  },
  polygon: {
    graph:
      "https://subgraph-endpoints.superfluid.dev/polygon-mainnet/protocol-v1",
  },
  scroll: {
    graph:
      "https://subgraph-endpoints.superfluid.dev/scroll-mainnet/protocol-v1",
  },
  xdai: {
    graph: "https://subgraph-endpoints.superfluid.dev/xdai-mainnet/protocol-v1",
  },
};

module.exports = {
  methodology: `TVL is the value of SuperTokens in circulation. SuperTokens are Superfluid protocol's extension of the ERC20 token standard with additional functionalities like Money Streaming or Distributions. More on SuperTokens here: https://docs.superfluid.finance/docs/concepts/overview/super-tokens`,
  hallmarks: [[1644278400, "Fake ctx hack"]],
};

Object.keys(subgraphEndpoints).forEach((chain) => {
  const { graph } = subgraphEndpoints[chain];
  module.exports[chain] = {
    tvl: async (api, _b, { [chain]: block }) =>
      retrieveSupertokensBalances(chain, block, false, api, graph),
    vesting: async (api, _b, { [chain]: block }) =>
      retrieveSupertokensBalances(chain, block, true, api, graph),
  };
});
