const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const PAIR_FACTORY = "0x0fC7e80090bbc1740595b1fcCd33E0e82547212F";
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

const getPairs = async (toBlock) => {
  const logs = (await sdk.api.util.getLogs({
    target: PAIR_FACTORY,
    topic: 'PairCreated(address,address,address)',
    keys: [],
    fromBlock: START_BLOCK,
    toBlock,
  })).output

  return logs.map(log => {
    return {
      pair: `0x${log.topics[1].substr(-40).toLowerCase()}`,
      tokenA: `0x${log.topics[2].substr(-40).toLowerCase()}`,
      tokenB: `0x${log.topics[3].substr(-40).toLowerCase()}`
    }
  })
}

const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const pairs = await getPairs(ethBlock)

  await calculateTokenTotal(
    balances, 
    ethBlock, 
    pairs.map(({ pair, tokenA }) => ({ pair, token: tokenA })),
    abi.totalSupplyAmount
  )

  await calculateTokenTotal(
    balances, 
    ethBlock, 
    pairs.map(({ pair, tokenB }) => ({ pair, token: tokenB })),
    abi.totalSupplyAmount
  )

  const borrows = await borrowed(timestamp, ethBlock, chainBlocks);

  for (let b of Object.keys(balances)) {
    balances[b] -= borrows[b];
  };

  return balances;
};

const borrowed = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const pairs = await getPairs(ethBlock)

  await calculateTokenTotal(
    balances,
    ethBlock,
    pairs.map(({ pair, tokenA }) => ({ pair, token: tokenA })),
    abi.totalDebtAmount
  )

  await calculateTokenTotal(
    balances,
    ethBlock,
    pairs.map(({ pair, tokenB }) => ({ pair, token: tokenB })),
    abi.totalDebtAmount
  )

  return balances
}

module.exports = {
  ethereum: {
    tvl: ethTvl,
    borrowed
  },
  tvl: sdk.util.sumChainTvls([ethTvl]),
};
