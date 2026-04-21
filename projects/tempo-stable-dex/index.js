const { getConfig } = require('../helper/cache')
const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  tempo: { factory: '0xdec0000000000000000000000000000000000000', fromBlock: 6061454},
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      // const logs = await getLogs2({ api, factory, eventAbi: 'event PairCreated(bytes32 indexed key, address indexed base, address indexed quote)', fromBlock, })
      const { balances } = await getConfig('tempo-stable-dex', 'https://explore.tempo.xyz/api/address/balances/0xdec0000000000000000000000000000000000000')
      return api.sumTokens({ owner: factory, tokens: balances.map(i => i.token) })
    }
  }
})