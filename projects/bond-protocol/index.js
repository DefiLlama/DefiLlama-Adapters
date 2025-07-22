const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  arbitrum: { factory: '0x007FE70dc9797C4198528aE43d8195ffF82Bdc95', fromBlock: 43273954, tellerFactory: '0x007f7735baf391e207e3aa380bb53c4bd9a5fed6', tellerBlock: 43273983, },
  ethereum: { factory: '0x007FE70dc9797C4198528aE43d8195ffF82Bdc95', fromBlock: 15998037, tellerFactory: '0x007f7735baf391e207e3aa380bb53c4bd9a5fed6', tellerBlock: 15998038, },
}

module.exports = {
};

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, tellerFactory, tellerBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tellerLogs = await getLogs({
        api,
        target: tellerFactory,
        topics: ['0xd5a20d99fad8d4fec2eae3eb7d21c0bebeaecce7cf87b698ddba05071e7bde27'],
        eventAbi: 'event ERC1155BondTokenCreated (uint256 tokenId, address indexed underlying, uint48 indexed expiry)',
        onlyArgs: true,
        fromBlock: tellerBlock,
      })
      const tellerTokens = tellerLogs.map(i => i.underlying)
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0x4fd9a46575749d9ddf290fadaa5729fc640790e2b6360df8cc8af35e418dcec0'],
        eventAbi: 'event ERC20BondTokenCreated (address bondToken, address indexed underlying, uint48 indexed expiry)',
        onlyArgs: true,
        fromBlock,
      })
      const tokens = logs.map(i => i.underlying)
      return sumTokens2({ api, ownerTokens: [[tokens, factory], [tellerTokens, tellerFactory]], })
    }
  }
})