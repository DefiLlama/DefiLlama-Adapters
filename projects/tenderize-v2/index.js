const { getLogs } = require('../helper/cache/getLogs')

const config = {
  arbitrum: { factory: '0xa7cA8732Be369CaEaE8C230537Fc8EF82a3387EE', fromBlock: 175531230 },
  ethereum: { factory: '0xa7cA8732Be369CaEaE8C230537Fc8EF82a3387EE', fromBlock: 19115337 },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        eventAbi: 'event NewTenderizer (address indexed asset, address indexed validator, address tenderizer)',
        onlyArgs: true,
        fromBlock,
      })
      const tenderizers = logs.map(log => log.tenderizer)
      const tokens = logs.map(log => log.asset)
      const supplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: tenderizers })
      const calls = tenderizers.map((tenderizer, idx) => ({ target: tenderizer, params: supplies[idx] }))
      const bals = await api.multiCall({  abi: 'function convertToAssets(uint256) view returns (uint256)', calls})
      api.addTokens(tokens, bals)
    }
  }
})
