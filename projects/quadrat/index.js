const { getLogs } = require('../helper/cache/getLogs')
const sdk = require('@defillama/sdk')

module.exports = {
  doublecounted: true,
  methodology: 'Counts the tokens locked in Strategy Vaults in Uniswap v3 Pools.',
  start: 1667197843, // Mon Oct 31 2022 06:30:43 GMT+0000
};

const config = {
  ethereum: {
    factory: '0x823db50c56d8a994af0ceb3f7dc421852cf6fbff',
    fromBlock: 15891335,
  },
  optimism: {
    factory: '0x3ae3b506a39ffc1aa3964f6dc888891ea10671ed',
    fromBlock: 33415677,
  },
  polygon: {
    factory: '0x1a639e9249d26c70edf0b7410a8495d9b72140ff',
    fromBlock: 35028277,
  },
  arbitrum: {
    factory: '0xb8d498f025c45a8a7a63277cb1cca36c2599bbd7',
    fromBlock: 34510988,
  },
  bsc: {
    factory: '0x28e9f86690449059734e079eaaa66d8913263bed',
    fromBlock: 26497758,
  },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const balances = {}

      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0x9c5d829b9b23efc461f9aeef91979ec04bb903feb3bee4f26d22114abfc7335b'],
        fromBlock,
        onlyArgs: true,
        eventAbi: 'event PoolCreated (address indexed uniPool, address indexed manager, address indexed pool)'
      })

      const calls = logs.map(i => i.pool)

      const [token0, token1, bals] = await Promise.all([
        api.multiCall({ abi: 'address:token0', calls }),
        api.multiCall({ abi: 'address:token1', calls }),
        api.multiCall({ abi: 'function getUnderlyingBalances() view returns (uint256 amount0, uint256 amount1)', calls, permitFailure: true }),
      ])

      bals.forEach((val, i) => {
        if (!val) return;
        const { amount0, amount1 } = val
        sdk.util.sumSingleBalance(balances, token0[i], amount0, api.chain)
        sdk.util.sumSingleBalance(balances, token1[i], amount1, api.chain)
      })

      return balances
    }
  }
})