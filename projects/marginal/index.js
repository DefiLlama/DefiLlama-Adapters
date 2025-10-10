const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  base: { factory: '0x407fA8029852A8386a907287018CEAFd7242C621', fromBlock: 17016522 },
  ethereum: { factory: '0x95D95C41436C15b50217Bf1C0f810536AD181C13', fromBlock: 20297876 },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory, eventAbi: 'event PoolCreated (address indexed token0, address indexed token1, uint24 maintenance, address indexed oracle, address pool)', fromBlock, })
      const ownerTokens = logs.map(log => [[log.token0, log.token1], log.pool])
      return api.sumTokens({ ownerTokens })
    }
  }
})