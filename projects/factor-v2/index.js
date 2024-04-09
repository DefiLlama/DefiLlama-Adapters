const { getLogs } = require('../helper/cache/getLogs')

const config = {
  arbitrum: { factory: '0x6b3e693b436510c430ffbb6b5ca6c8248022f1cd', fromBlock: 112324705 },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0xc66cfbda93c132fbda8600e8032ce13d18d0db1d139e72d677d5556e0acf9484'],
        eventAbi: 'event  VaultCreated (address indexed vault, address strategy, string name, string symbol, uint256 approval)',
        onlyArgs: true,
        fromBlock,
      })
      const vaults = logs.map(log => log.vault)
      const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
      const bals = await api.multiCall({ abi: 'uint256:assetBalance', calls: vaults })
      // console.table(vaults.map((v, i) => ({ vault: v, token: tokens[i], bal: bals[i] })))
      api.addTokens(tokens, bals)
    }
  }
})