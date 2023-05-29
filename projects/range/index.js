const { getLogs } = require('../helper/cache/getLogs')

const ABI = require('./abi.json');
const config = {
  ethereum: { factory: '0xf1e70677fb1f49471604c012e8B42BA11226336b', fromBlock: 17266660, },
  arbitrum: { factory: '0xB9084c75D361D1d4cfC7663ef31591DeAB1086d6', fromBlock: 88503603, },
  bsc: { factory: '0xad2b34a2245b5a7378964BC820e8F34D14adF312', fromBlock: 28026886, },
  polygon: { factory: '0xad2b34a2245b5a7378964BC820e8F34D14adF312', fromBlock: 42446548, }
}

module.exports = {
  methodology: 'assets deployed on DEX as LP + asset balance of vaults',
  doublecounted: true,
  start: 1683965157,
};

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({
        api,
        target: factory,
        topic: 'VaultCreated(address,address)',
        eventAbi: 'event VaultCreated(address indexed uniPool, address indexed vault)',
        onlyArgs: true,
        fromBlock,
      })
      const vaults = logs.map(log => log.vault)
      const token0s = await api.multiCall({ abi: "address:token0", calls: vaults, })
      const token1s = await api.multiCall({ abi: "address:token1", calls: vaults, })
      const bals = await api.multiCall({ abi: ABI.underlyingBalance, calls: vaults, })
      bals.forEach(({ amount0Current, amount1Current }, i) => {
        api.add(token0s[i], amount0Current)
        api.add(token1s[i], amount1Current)
      })
    }
  }
})