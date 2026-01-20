const ADDRESSES = require('./helper/coreAssets.json')
const { getBlock, blockQuery } = require("./helper/http");

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

const blacklistedSymbolsByChain = {
  base: new Set(['SUP']),
};

// Fetch and paginate all SuperTokens at a given block
async function fetchAllSuperTokens(graphUrl, blockForQuery) {
  const PAGE_SIZE = 1000;
  let lastId = "";
  const allTokens = [];
  let hasMore = true
  while (hasMore) {
    const query = supertokensQuery({ first: PAGE_SIZE, id_gt: lastId });
    const res = await blockQuery(graphUrl, query, {
      api: { getBlock: () => blockForQuery, block: blockForQuery },
    });
    const tokens = res.tokens;
    if (!tokens?.length) {
      hasMore = false
      break;
    }
    allTokens.push(...tokens);
    if (tokens.length < PAGE_SIZE) {
      hasMore = false
      break;
    }
    lastId = tokens[tokens.length - 1].id;
  }
  return allTokens;
}

// ALEPH custom locker address used on Base and Avalanche
const ALEPH_LOCKER = "0xb6e45ADfa0C7D70886bBFC990790d64620F1BAE8".toLowerCase();
// ALEPH SuperToken address (same on Base and Avalanche)
const ALEPH_SUPERTOKEN = "0xc0Fbc4967259786C743361a5885ef49380473dCF".toLowerCase();

// MIVA token locker addresses (on xDai/Gnosis). Circulating = totalSupply - sum(locker balances)
const MIVA_LOCKERS = [
  "0x50e39b354c90146de80a577e13129bb0ba36ee45",
  "0x791B3A48D2dca38871C9900783653b15aCae0Aea",
  "0x6A0491132aF4d0925F857A5000bb21e5C5C195EA",
  "0x8F00FC7756C9E901963B723AD1821E5EB8C69C02",
  "0x10DAF0DF6Ec9bEF452F3073A56f6adB4B1809222",
  "0xa2eac044fe1e004cAaC4E8C4164a39F4Cc522b6f",
  "0x89Abea6823cfd903fB503A1DB17a7ce890A3232e",
  "0xFd989d6E3244cFb5470597E7B93E4430CC29EfE9",
  "0x867e84EB2789c95eEF6d6991cC4bC6B48e1519b8",
  "0x16daae140FbC2F854Cf61af0512Bd8CD627d0B8e",
  "0xA298D0b6B9216f7d9EB252DeA06280b748eFe8E5",
  "0x1d9896F00fd51df839B2F5B7fFdD0bD60b471CeF",
  "0xDfdec8DF5cfF5DaAb3ec635E477517AC92251dfD",
  "0xeCD2D1bB2776f00AD15F976F349A1ab01F8ce398",
  "0x5B339241312024382C9768b3598f60eCF34Ae779",
];

// Main function for all chains to get balances of superfluid tokens
async function getChainBalances(allTokens, chain, block, isVesting, api) {
  // Abi MultiCall to get supertokens supplies
  const supply = await api.multiCall({
    abi: "erc20:totalSupply",
    calls: allTokens.map((token) => token.id),
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

    const tokenSymbol = symbol?.toUpperCase();
    const underlyingSymbol = underlyingToken?.symbol?.toUpperCase();

    const chainBlacklist = blacklistedSymbolsByChain[chain];
    const isBlacklistedSymbol =
      (chainBlacklist && tokenSymbol && chainBlacklist.has(tokenSymbol)) ||
      (chainBlacklist && underlyingSymbol && chainBlacklist.has(underlyingSymbol));

    if (isBlacklistedSymbol) continue;

    let prefixedUnderlyingAddress = underlyingAddress;
    if (
      underlyingAddress &&
      blacklistedSuperTokens.has(underlyingAddress.toLowerCase())
    ) continue;

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

    // MIVA token special logic (Gnosis/xDai): circulating = totalSupply - sum(locker balances)
    if (symbol && symbol.toUpperCase() === 'MIVA') {
      const lockerHoldings = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: MIVA_LOCKERS.map((locker) => ({ target: id, params: [locker] })),
      });
      const totalLocked = lockerHoldings.reduce((sum, v) => sum + (Number(v) || 0), 0);
      const circulating = Math.max(0, totalSupply - totalLocked);
      api.add(id, circulating);
      continue;
    }

    if (isNativeAssetSuperToken) {
      // For native asset SuperTokens (like ETHx), use the chain's native token
      api.add(ADDRESSES.null, totalSupply);
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

  const allTokens = await fetchAllSuperTokens(graphUrl, blockForQuery);
  const filteredTokens = allTokens.filter((t) => t.isSuperToken);
  await getChainBalances(filteredTokens, chain, block, isVesting, api);
  return api.getBalances();
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
