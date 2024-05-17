const { getLogs2 } = require('../helper/cache/getLogs')
const config = {
  bsc: { fromBlock: 35953570 },
  arbitrum: { fromBlock: 184614246 },
}

module.exports = {
  start: 1707300000,
  methodology: "BurveProtocol TVL including total values of assets locked in the tokens which is deployed by BurveProtocol",
}

Object.keys(config).forEach(chain => {
  const { factory = '0xedc1bf1993b635478c66ddfd1a5a01c81a38551b', fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = await getLogs2({ api, factory, eventAbi: 'event LogTokenDeployed (string tokenType, string bondingCurveType, uint256 tokenId, address deployedAddr)', fromBlock, transform: i => i.deployedAddr })
      const uTokens = await api.multiCall({ abi: 'address:getRaisingToken', calls: tokens })
      return api.sumTokens({ tokensAndOwners2: [uTokens, tokens] })
    }
  }
})
