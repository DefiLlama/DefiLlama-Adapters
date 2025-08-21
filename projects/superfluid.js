const { getBlock } = require("./helper/http");
const { blockQuery } = require("./helper/http");

const supertokensQuery = ({ first = 1000, id_gt = "" } = {}) => `
query get_supertokens($block: Int) {
  tokens(
    first: ${first},
    block: { number: $block },
    where: { isSuperToken: true${id_gt ? `, id_gt: "${id_gt}"` : ""} },
    orderBy: id,
    orderDirection: asc
  ) {
      id
  underlyingAddress
  name
  underlyingToken { name decimals symbol id }
  symbol
  decimals
  isSuperToken
  isNativeAssetSuperToken
  isListed
  }
}`;

const blacklistedSuperTokens = new Set(
  ["0x441bb79f2da0daf457bad3d401edb68535fb3faa"].map((i) => i.toLowerCase())
);

// ALEPH custom locker address used on Base and Avalanche
const ALEPH_LOCKER = "0xb6e45ADfa0C7D70886bBFC990790d64620F1BAE8".toLowerCase();
// ALEPH SuperToken address (same on Base and Avalanche)
const ALEPH_SUPERTOKEN = "0xc0Fbc4967259786C743361a5885ef49380473dCF".toLowerCase();

// Main function for all chains to get balances of superfluid tokens
async function getChainBalances(allTokens, chain, block, isVesting, api) {
  // Init empty balances
  let balances = {};

  // Abi MultiCall to get supertokens supplies
  const supply = await api.multiCall({
    abi: "erc20:totalSupply", // abi['totalSupply'],
    calls: allTokens.map(token => token.id),
  });

  for (let i = 0; i < supply.length; i++) {
    const totalSupply = supply[i];
    const {
      id,
      underlyingAddress,
      underlyingToken,
      decimals,
      name,
      symbol,
      isNativeAssetSuperToken,
    } = allTokens[i];

    // Accumulate to balances, the balance for tokens on mainnet or sidechain
    let prefixedUnderlyingAddress = underlyingAddress;
    if (
      underlyingAddress &&
      blacklistedSuperTokens.has(underlyingAddress.toLowerCase())
    )
      continue;

    // ALEPH custom logic (Base and Avalanche): no underlying; circulating = totalSupply - locker balance
    if (
      (chain === 'base' || chain === 'avax') &&
      id.toLowerCase() === ALEPH_SUPERTOKEN
    ) {
      const lockerHolding = await api.call({ abi: 'erc20:balanceOf', target: id, params: [ALEPH_LOCKER] });
      const circulating = Math.max(0, totalSupply - lockerHolding);
      api.add(id, circulating);
      continue;
    }

    if (isNativeAssetSuperToken) {
      // For native asset SuperTokens (like ETHx), use the chain's native token
      api.add('0x0000000000000000000000000000000000000000', totalSupply);
      continue;
    }

    if (underlyingToken) {
      // For wrapped tokens (default), convert to underlying units
      const underlyingDecimals = (underlyingToken || { decimals: 18 }).decimals;
      const underlyingTokenBalance =
        (totalSupply * 10 ** underlyingDecimals) / 10 ** decimals;
      api.add(prefixedUnderlyingAddress, underlyingTokenBalance);
      continue;
    }

    // For pure SuperTokens (no underlying), use the SuperToken's own address
    api.add(id, totalSupply);
  }
}

async function retrieveSupertokensBalances(
  chain,
  block,
  isVesting,
  api,
  graphUrl
) {
  let blockNum;
  try {
    blockNum = await getBlock(api.timestamp, chain, { [chain]: block });
  } catch (e) {
    // If block lookup fails for this chain/date (e.g. pre-genesis), skip it
    return;
  }

  // Ensure we don't query subgraphs before their start block set in the manifest (pre protocol deployment)
  const subgraphStartBlocks = {
    scroll: 2_575_000,
    degen: 26188017,
    base: 1000000,
    ethereum: 15870000,
    celo: 16393000,
    bsc: 18800000,
    avax: 14700000,
    arbitrum: 7600000,
    optimism: 4300000,
    polygon: 11650500,
    xdai: 14820000,
  };
  const minStart = subgraphStartBlocks[chain] || 0;
  // If requested block is before the subgraph started indexing ( protocol deployment ), return 0 for this chain
  if (minStart && blockNum < minStart) return;
  const blockForQuery = (blockNum || 0);

  const PAGE_SIZE = 1000;
  let lastId = "";
  let allTokens = [];
  let tokens = [];
  do {
    const query = supertokensQuery({ first: PAGE_SIZE, id_gt: lastId });

    const { queriedTokens } = await blockQuery(graphUrl, query, {
      api: { getBlock: () => blockForQuery, block: blockForQuery },
    });

    tokens = queriedTokens

    if (!tokens?.length) break;
    allTokens.push(...tokens);
    lastId = tokens[tokens.length - 1].id;
  } while (tokens.length < PAGE_SIZE)

  const filteredTokens = allTokens.filter((t) => t.isSuperToken);
  return getChainBalances(filteredTokens, chain, block, isVesting, api);
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
  // degen: {
  //   graph: "https://degenchain.subgraph.x.superfluid.dev",
  // },
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
