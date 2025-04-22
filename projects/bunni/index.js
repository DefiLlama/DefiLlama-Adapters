const sdk = require('@defillama/sdk');
const { getLogs } = require('../helper/cache/getLogs')

const config = {
  ethereum: {
    lens: '0xb73f303472c4fd4ff3b9f59ce0f9b13e47fbfd19',
    factory: '0xb5087f95643a9a4069471a28d32c569d9bd57fe4',
    fromBlock: 15743582,
  },
  arbitrum: {
    lens: '0xb73f303472c4fd4ff3b9f59ce0f9b13e47fbfd19',
    factory: '0xb5087f95643a9a4069471a28d32c569d9bd57fe4',
    fromBlock: 30690986,
  },
  optimism: {
    lens: '0xb73f303472c4fd4ff3b9f59ce0f9b13e47fbfd19',
    factory: '0xb5087f95643a9a4069471a28d32c569d9bd57fe4',
    fromBlock: 29258949,
  },
  polygon: {
    lens: '0xb73f303472c4fd4ff3b9f59ce0f9b13e47fbfd19',
    factory: '0xb5087f95643a9a4069471a28d32c569d9bd57fe4',
    fromBlock: 34323928,
  },
}

module.exports = {
  doublecounted: true,
  hallmarks: [
    [1674475200,"$oLIT Rewards Start"]
  ],
};

const abi = 'function getReserves(tuple(address pool, int24 tickLower, int24 tickUpper) key) view returns (uint112 reserve0, uint112 reserve1)'
const eventAbi = 'event NewBunni (address indexed  token, bytes32 indexed  bunniKeyHash, address indexed  pool, int24 tickLower, int24 tickUpper)'

Object.keys(config).forEach(chain => {
  const { lens, fromBlock, factory } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const balances = {}
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0xa633a76553e9d8d77256f9284d85ae2eb5e5ef445d9e5686e3e6270e2e8fd4a8'],
        fromBlock,
        eventAbi,
      })
      const calls = logs.map(({ args: i }) => ({ params: [[i.pool, i.tickLower, i.tickUpper]] }))
      const res = await api.multiCall({ abi, calls, target: lens })
      let tokenCalls = []
      let reserves = res.filter((val, i) => {
        if (!(+val.reserve0 || +val.reserve1)) return; // ignore tokens without reserve
        tokenCalls.push(logs[i].args.pool)
        return val
      })
      let token0s = await api.multiCall({ abi: 'address:token0', calls: tokenCalls })
      let token1s = await api.multiCall({ abi: 'address:token1', calls: tokenCalls })
      reserves.forEach(({ reserve0, reserve1 }, i) => {
        sdk.util.sumSingleBalance(balances, token0s[i], reserve0, chain)
        sdk.util.sumSingleBalance(balances, token1s[i], reserve1, chain)
      })
      return balances
    }
  }
})
