const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const PAIR_FACTORY = "0x0fC7e80090bbc1740595b1fcCd33E0e82547212F";
const START_BLOCK = 13847198

const calculateTvl = async (balances, block, pairs) => {
  const pairsTokenBalances = (await sdk.api.abi.multiCall({
    abi: abi.totalSupplyAmount,
    calls: pairs.map(pair => ({
      target: pair.pair,
      params: pair.token
    })),
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

const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const logs = (await sdk.api.util.getLogs({
    target: PAIR_FACTORY,
    topic: 'PairCreated(address,address,address)',
    keys: [],
    fromBlock: START_BLOCK,
    toBlock: ethBlock,
  })).output

  const pairs = logs.map(log => {
    return {
      pair: `0x${log.topics[1].substr(-40).toLowerCase()}`,
      tokenA: `0x${log.topics[2].substr(-40).toLowerCase()}`,
      tokenB: `0x${log.topics[3].substr(-40).toLowerCase()}`
    }
  })

  await calculateTvl(
    balances, 
    ethBlock, 
    pairs.map(({ pair, tokenA }) => ({ pair, token: tokenA })) 
  )

  await calculateTvl(
    balances, 
    ethBlock, 
    pairs.map(({ pair, tokenB }) => ({ pair, token: tokenB })) 
  )

  return balances;
};

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl]),
};
