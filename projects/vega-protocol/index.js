const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

const assetListedEvent = "event Asset_Listed(address indexed asset_source, bytes32 indexed vega_asset_id, uint256 nonce)"

const config = {
  ethereum: { bridge: '0x124Dd8a6044ef048614AEA0AAC86643a8Ae1312D', fromBlock: 15263615, vega: '0xcb84d72e61e383767c4dfeb2d8ff7f4fb89abc6e', stakingContract: '0x195064D33f09e0c42cF98E665D9506e0dC17de68', assetPool: '0xF0f0FcDA832415b935802c6dAD0a6dA2c7EAed8f' }
}

module.exports = {
};

Object.keys(config).forEach(chain => {
  const { bridge, fromBlock, vega, stakingContract, assetPool, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({
        api,
        target: bridge,
        topics: ['0x4180d77d05ff0d31650c548c23f2de07a3da3ad42e3dd6edd817b438a150452e'],
        eventAbi: assetListedEvent,
        onlyArgs: true,
        fromBlock,
      })
      const blacklistedTokens = []
      if (vega) blacklistedTokens.push(vega)
      return sumTokens2({ api, blacklistedTokens, owner: assetPool, tokens: logs.map(i => i.asset_source) })
    }
  }


  if (staking) module.exports[chain].staking = staking(stakingContract, vega)
})