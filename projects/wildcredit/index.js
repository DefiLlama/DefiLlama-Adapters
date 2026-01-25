const abi = {
    "factory": "address:factory",
    "tokenA": "address:tokenA",
    "tokenB": "address:tokenB",
    "totalDebt": "function totalDebt(address) view returns (uint256)",
    "totalSupplyAmount": "function totalSupplyAmount(address) view returns (uint256)",
    "totalDebtAmount": "function totalDebtAmount(address) view returns (uint256)",
    "balanceOf": "function balanceOf(address owner) view returns (uint256)",
    "tokenOfOwnerByIndex": "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
    "getPool": "function getPool(address, address, uint24) view returns (address)",
    "slot0": "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
    "positions": "function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)"
  };
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs, getLogs2 } = require('../helper/cache/getLogs')

const PAIR_FACTORY = "0x0fC7e80090bbc1740595b1fcCd33E0e82547212F";
const START_BLOCK = 13847198

const calculateTokenTotal = async (api, pairs, abi) => {
  const pairsTokenBalances = await api.multiCall({
    calls: pairs.map(pair => ({
      target: pair.pair,
      params: pair.token
    })),
    abi,
  })
  const tokens = pairs.map(pair => pair.token)
  api.add(tokens, pairsTokenBalances)
}

const getPairs = async (api) => {
  return getLogs2({
    target: PAIR_FACTORY,
    eventAbi: 'event PairCreated(address indexed pair, address indexed tokenA, address indexed tokenB)',
    fromBlock: START_BLOCK,
    api, 
    onlyUseExistingCache: true,
  })
}

const ethTvl = async (api) => {
  const pairs = await getPairs(api)
  const ownerTokens = pairs.map(p => [[p.tokenA, p.tokenB], p.pair])
  await api.sumTokens({ ownerTokens })

  await sumTokens2({ api, resolveUniV3: true, owners: pairs.map(p => p.pair) })
};

function getTokenPairs(pairs, key) {
  return pairs.map(p => ({ pair: p.pair, token: p[key] }))
}

const borrowed = async (api) => {
  const pairs = await getPairs(api)
  await calculateTokenTotal(api, getTokenPairs(pairs, 'tokenA'), abi.totalDebtAmount)
  await calculateTokenTotal(api, getTokenPairs(pairs, 'tokenB'), abi.totalDebtAmount)
}

module.exports = {
  ethereum: {
    tvl: ethTvl,
    borrowed
  },
};
