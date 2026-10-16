const { sumTokens2 } = require('../helper/unwrapLPs')

const FACTORIES = [
  '0x83FE469C636C4081b87bA5b3Ae9991c6Ed104248', // basic pools (volatile + stable)
  '0xBB24AF5c6fB88F1d191FA76055e30BF881BeEb79', // concentrated liquidity pools
]

async function tvl(api) {
  for (const factory of FACTORIES) {
    const pools = await api.fetchList({
      target: factory,
      lengthAbi: 'uint256:allPoolsLength',
      itemAbi: 'function allPools(uint256) view returns (address)',
    })
    const token0s = await api.multiCall({ abi: 'address:token0', calls: pools })
    const token1s = await api.multiCall({ abi: 'address:token1', calls: pools })
    const tokensAndOwners = pools.flatMap((pool, i) => [[token0s[i], pool], [token1s[i], pool]])
    await sumTokens2({ api, tokensAndOwners })
  }
}

module.exports = {
  methodology: 'Counts the underlying token balances held by every Mezo Swap pool, across both the basic pool factory and the concentrated-liquidity (Slipstream) factory.',
  mezo: { tvl },
}
