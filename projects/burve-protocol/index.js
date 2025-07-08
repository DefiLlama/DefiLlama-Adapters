const { getLogs2 } = require('../helper/cache/getLogs')
const config = {
  bsc: { fromBlock: 35953570 },
  arbitrum: { fromBlock: 184614246 },
  base: { fromBlock: 15653766 },
}

module.exports = {
  start: '2024-02-07',
  methodology: "The TVL including total values of assets locked in the tokens which are deployed by BurveProtocol",
}

Object.keys(config).forEach(chain => {
  const { factory = '0xedc1bf1993b635478c66ddfd1a5a01c81a38551b', fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = await getLogs2({ api, factory, eventAbi: 'event LogTokenDeployed (string tokenType, string bondingCurveType, uint256 tokenId, address deployedAddr)', fromBlock, transform: i => i.deployedAddr })
      const uTokens = await api.multiCall({ abi: 'address:getRaisingToken', calls: tokens, permitFailure: true })
      const tokensAndOwners = uTokens.map((u, i) => [u, tokens[i]]).filter(t => t[0])
      return api.sumTokens({ tokensAndOwners, blacklistedTokens: tokens })
    }
  }
})
