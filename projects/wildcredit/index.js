const abi = require("./abi.json");
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
