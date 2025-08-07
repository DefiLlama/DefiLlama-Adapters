const { getBlock } = require("./helper/http");
const { blockQuery } = require("./helper/http");

const supertokensQuery = `
query get_supertokens($block: Int) {
  tokens(
    first: 1000, 
    block: { number: $block } 
    where:{
     isSuperToken:true,
     isListed:true
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

const blacklistedSuperTokens = new Set(
  ["0x441bb79f2da0daf457bad3d401edb68535fb3faa"].map((i) => i.toLowerCase())
);

// Main function for all chains to get balances of superfluid tokens
async function getChainBalances(allTokens, chain, block, isVesting, api) {
  // Init empty balances
  let balances = {};

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
    if (blacklistedSuperTokens.has(underlyingAddress.toLowerCase()))
      return;

    if (isNativeAssetSuperToken) {
      // For native asset SuperTokens (like ETHx), use the chain's native token
      api.add('0x0000000000000000000000000000000000000000', totalSupply);
    } else if (underlyingToken) {
      // For wrapped tokens, use the underlying token's address
      api.add(prefixedUnderlyingAddress, underlyingTokenBalance);
    } else {
      // For pure SuperTokens (no underlying), use the SuperToken's own address
      api.add(id, totalSupply);
    }
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
    //Abit of a delay to avoid subgraph being out sync erroring the query
    api: { getBlock: () => blockNum - 20, block: blockNum - 20 },
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
    graph: "https://arbitrum-one.subgraph.x.superfluid.dev",
  },
  avax: {
    graph: "https://avalanche-c.subgraph.x.superfluid.dev",
  },
  base: {
    graph: "https://base-mainnet.subgraph.x.superfluid.dev",
  },
  bsc: {
    graph: "https://bsc-mainnet.subgraph.x.superfluid.dev",
  },
  degen: {
    graph: "https://degenchain.subgraph.x.superfluid.dev",
  },
  ethereum: {
    graph: "https://eth-mainnet.subgraph.x.superfluid.dev",
  },
  optimism: {
    graph: "https://optimism-mainnet.subgraph.x.superfluid.dev",
  },
  polygon: {
    graph: "https://polygon-mainnet.subgraph.x.superfluid.dev",
  },
  scroll: {
    graph: "https://scroll-mainnet.subgraph.x.superfluid.dev",
  },
  xdai: {
    graph: "https://xdai-mainnet.subgraph.x.superfluid.dev",
  },
  celo: {
    graph: "https://celo-mainnet.subgraph.x.superfluid.dev",
  },
};

module.exports = {
  methodology: `TVL is the value of SuperTokens in circulation. SuperTokens are Superfluid protocol's extension of the ERC20 token standard with additional functionalities like Money Streaming or Distributions. More on SuperTokens here: https://docs.superfluid.finance/docs/concepts/overview/super-tokens`,
  // hallmarks: [[1644278400, "Fake ctx hack"]],
};

Object.keys(subgraphEndpoints).forEach((chain) => {
  const { graph } = subgraphEndpoints[chain];
  module.exports[chain] = {
    tvl: async (api, _b, { [chain]: block }) =>
      retrieveSupertokensBalances(chain, block, false, api, graph),
}
});
