const { isWhitelistedToken } = require('../helper/streamingHelper')

const BASE_CONFIG = {
  tokenVesting: "0x2CDE9919e81b20B4B33DD562a48a84b54C48F00C",
  votingVesting: "0x1bb64AF7FE05fc69c740609267d2AbE3e119Ef82",
  tokenLockUp: "0x1961A23409CA59EEDCA6a99c97E4087DaD752486",
  votingTokenLockUp: "0x73cD8626b3cD47B009E68380720CFE6679A3Ec3D",
  boundTokenLockUp: "0xA600EC7Db69DFCD21f19face5B209a55EAb7a7C0",
  boundVotingTokenLockUp: "0xdE8465D44eBfC761Ee3525740E06C916886E1aEB",
};

const CONFIG = {
  ethereum: { ...BASE_CONFIG },
  arbitrum: { ...BASE_CONFIG },
  optimism: { ...BASE_CONFIG },
  polygon: { ...BASE_CONFIG },
  avax: { ...BASE_CONFIG },
  base: { ...BASE_CONFIG },
  bsc: { ...BASE_CONFIG },
  linea: { ...BASE_CONFIG },
  mode: { ...BASE_CONFIG,
    votingTokenLockUp: "0xA600EC7Db69DFCD21f19face5B209a55EAb7a7C0",
    boundVotingTokenLockUp: "0x38E74A3DA3bd27dd581d5948ba19F0f684a5272f"
    },
  berachain: { ...BASE_CONFIG,
    votingTokenLockUp: "0xA600EC7Db69DFCD21f19face5B209a55EAb7a7C0",
    boundVotingTokenLockUp: "0x38E74A3DA3bd27dd581d5948ba19F0f684a5272f"
   },
  era: {
    tokenVesting: "0x04d3b05BBACe50d6627139d55B1793E2c03C53F0",
    votingVesting: "0xa824f42d4B6b3C51ab24dFdb268C232216a2D691",
    tokenLockUp: "0x1e290Ad7efc6E9102eCDB3D85dAB0e8e10cA690f",
    votingTokenLockUp: "0x815a28bB9A5ea36C03Bc6B21072fb4e99D66b6f4",
    boundTokenLockUp: "0xa83DFE7365A250faB1c3e10451676Af5DEF36E08",
    boundVotingTokenLockUp: "0xc7EEFF556C4999169E96195b4091669C1ecA5C23",
  },
};

const abis = {
  totalSupply: "erc20:totalSupply",
  tokenByIndex: "function tokenByIndex(uint256) view returns (uint256)",
  plans: "function plans(uint256) view returns (address token, uint256 amount, uint256 start, uint256 cliff, uint256 rate, uint256 period)",
  planEnd: "function planEnd(uint256 planId) view returns (uint256 end)",
};

const cacheData = {};

const fetchVestingData = async (api) => {
  const config = CONFIG[api.chain];
  if (!config) return;

  const targets = Object.values(config);

  // Single fetchList across all contracts: tokenByIndex -> plans(tokenId).token
  const plans = await api.fetchList({
    targets,
    lengthAbi: abis.totalSupply,
    itemAbi: abis.tokenByIndex,
    itemAbi2: abis.plans,
    field2: 'token',
    permitFailure: true,
  });

  const rawTokens = [...new Set(plans.filter(Boolean).map(t => t.toLowerCase()))]
  const symbols = await api.multiCall({ calls: rawTokens, abi: 'erc20:symbol', permitFailure: true })
  const tokens = rawTokens.map((token, index) => {
    if (!symbols[index]) return null;
    return { token, symbol: symbols[index] }
  }).filter(Boolean)

  cacheData[api.chain] = { owners: targets, tokens }
  return cacheData[api.chain]
};

const computeBalances = async (api, isVesting) => {
  if (!cacheData[api.chain]) return;
  const { owners, tokens } = cacheData[api.chain]

  const whitelisted = []
  const notWhitelisted = []

  tokens.forEach(({ token, symbol }) => {
    if (isVesting) {
      notWhitelisted.push(token)
    } else if (isWhitelistedToken(symbol, token, isVesting)) {
      whitelisted.push(token)
    }
  })

  return api.sumTokens({ owners, tokens: isVesting ? notWhitelisted: whitelisted })
};

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      if (!cacheData[api.chain]) await fetchVestingData(api);
      await computeBalances(api, false);
    },
    vesting: async (api) => {
      if (!cacheData[api.chain]) await fetchVestingData(api);
      await computeBalances(api, true);
    },
  };
});