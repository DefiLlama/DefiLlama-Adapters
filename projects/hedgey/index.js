const { isWhitelistedToken } = require('../helper/streamingHelper')
const { getCache, setCache } = require('../helper/cache')
const { nullAddress } = require('../helper/tokenMapping')

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
const WEEK = 7 * 24 * 3600
const TAIL = 500

// tvl and vesting of a chain run at the same time and need the same data: both wait for one fetch
const fetchVestingData = (api) => {
  if (!cacheData[api.chain]) cacheData[api.chain] = _fetchVestingData(api).catch(e => { delete cacheData[api.chain]; throw e })
  return cacheData[api.chain]
}

// The plans are only read to learn which tokens the contracts hold: tens of thousands of plans for a few dozen tokens.
// The token list is stored. Once a week every plan is read again, and in between only the last TAIL plans of each
// contract are (new plans are appended at the end of the list), so the token of a new plan is found right away.
// A run at a past timestamp reads every plan and stores nothing.
const _fetchVestingData = async (api) => {
  const targets = Object.values(CONFIG[api.chain]);
  const now = Math.floor(Date.now() / 1000)
  const isCurrentRun = !api.timestamp || api.timestamp > now - 3600
  const cache = isCurrentRun ? await getCache('hedgey', api.chain) : {}
  const fullScan = !cache.lastFullScan || now - cache.lastFullScan > WEEK

  const supplies = await api.multiCall({ abi: abis.totalSupply, calls: targets, permitFailure: true })
  const indexCalls = []
  targets.forEach((target, i) => {
    const supply = +(supplies[i] ?? 0)
    for (let j = fullScan ? 0 : Math.max(0, supply - TAIL); j < supply; j++) indexCalls.push({ target, params: j })
  })
  const planIds = await api.multiCall({ abi: abis.tokenByIndex, calls: indexCalls, permitFailure: true })
  const planCalls = indexCalls.map(({ target }, i) => ({ target, params: planIds[i] })).filter(call => call.params != null)
  const plans = await api.multiCall({ abi: abis.plans, calls: planCalls, permitFailure: true })

  const found = plans.filter(plan => plan && plan.token !== nullAddress).map(plan => plan.token.toLowerCase())
  const rawTokens = [...new Set([...(cache.tokens ?? []), ...found])]
  if (isCurrentRun && (fullScan || rawTokens.length !== (cache.tokens ?? []).length))
    await setCache('hedgey', api.chain, { lastFullScan: fullScan ? now : cache.lastFullScan, tokens: rawTokens })

  const symbols = await api.multiCall({ calls: rawTokens, abi: 'erc20:symbol', permitFailure: true })
  const tokens = rawTokens.map((token, index) => {
    if (!symbols[index]) return null;
    return { token, symbol: symbols[index] }
  }).filter(Boolean)

  return { owners: targets, tokens }
};

const computeBalances = async (api, isVesting) => {
  const { owners, tokens } = await fetchVestingData(api)

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
    tvl: (api) => computeBalances(api, false),
    vesting: (api) => computeBalances(api, true),
  };
});