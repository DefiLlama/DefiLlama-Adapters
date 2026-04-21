const ADDRESSES = require('../helper/coreAssets.json')

const bridgeContracts = {
  ethereum: { owner: '0xf43a70B250a86003a952af7A7986CcC243B89D81', token: ADDRESSES.ethereum.USDC },
  base: { owner: '0x82675d0553D802039e6776C006BEb1b820a69d55', token: ADDRESSES.base.USDC },
  arbitrum: { owner: '0x82675d0553D802039e6776C006BEb1b820a69d55', token: ADDRESSES.arbitrum.USDC_CIRCLE },
}

Object.keys(bridgeContracts).forEach(chain => {
  module.exports[chain] = {
    tvl: (api) => api.sumTokens({
      owner: bridgeContracts[chain].owner,
      tokens: [bridgeContracts[chain].token],
    })
  }
})
