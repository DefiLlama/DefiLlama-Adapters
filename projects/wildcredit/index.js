const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const abi = require("./abi.json");
const { unwrapUniswapV3NFTs } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

BigNumber.config({ EXPONENTIAL_AT: 100 })

const PAIR_FACTORY = "0x0fC7e80090bbc1740595b1fcCd33E0e82547212F";
const UNI_V3_POSITION_MANAGER = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"
const START_BLOCK = 13847198

const calculateTokenTotal = async (balances, block, pairs, abi) => {
  const pairsTokenBalances = (await sdk.api.abi.multiCall({
    calls: pairs.map(pair => ({
      target: pair.pair,
      params: pair.token
    })),
    abi,
    block
  })).output.map(result => result.output);

  for (let index = 0; index < pairs.length; index++) {
    sdk.util.sumSingleBalance(
      balances,
      pairs[index].token,
      pairsTokenBalances[index]
    );
  }
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

const ethTvl = async (timestamp, ethBlock, chainBlocks, { api }) => {
  const balances = {};

  const pairs = await getPairs(api)
  await calculateTokenTotal(balances, ethBlock, getTokenPairs(pairs, 'tokenA'), abi.totalSupplyAmount)
  await calculateTokenTotal(balances, ethBlock, getTokenPairs(pairs, 'tokenB'), abi.totalSupplyAmount)

  await unwrapUniswapV3NFTs({ balances, nftsAndOwners: pairs.map(pair => [UNI_V3_POSITION_MANAGER, pair.pair,]), block: ethBlock, })

  return balances;
};

function getTokenPairs(pairs, key) {
  return pairs.map(p => ({ pair: p.pair, token: p[key] }))
}

const borrowed = async (timestamp, ethBlock, chainBlocks, { api }) => {
  const balances = {};

  const pairs = await getPairs(api)
  await calculateTokenTotal(balances, ethBlock, getTokenPairs(pairs, 'tokenA'), abi.totalDebtAmount)
  await calculateTokenTotal(balances, ethBlock, getTokenPairs(pairs, 'tokenB'), abi.totalDebtAmount)

  return balances
}

module.exports = {
  ethereum: {
    tvl: ethTvl,
    borrowed
  },
};
