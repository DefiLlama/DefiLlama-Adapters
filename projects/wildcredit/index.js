const abi = require("./abi.json");
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

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
  const logs = (await getLogs({
    target: PAIR_FACTORY,
    topic: 'PairCreated(address,address,address)',
    fromBlock: START_BLOCK,
    api,
  }))

  return logs.map(log => {
    return {
      pair: `0x${log.topics[1].substr(-40).toLowerCase()}`,
      tokenA: `0x${log.topics[2].substr(-40).toLowerCase()}`,
      tokenB: `0x${log.topics[3].substr(-40).toLowerCase()}`
    }
  })
}

const ethTvl = async (api) => {
  const pairs = await getPairs(api)
  await calculateTokenTotal(api, getTokenPairs(pairs, 'tokenA'), abi.totalSupplyAmount)
  await calculateTokenTotal(api, getTokenPairs(pairs, 'tokenB'), abi.totalSupplyAmount)

  await sumTokens2({ api, resolveUniV3: true, owners: pairs.map(pair => pair.pair) })
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
