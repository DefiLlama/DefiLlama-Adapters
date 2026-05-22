const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const NATIVE_BRIDGE = '0x5A9808d92a3EC9Cc20CF3f11243Ba64ADCd281Bc'
const USDC_BRIDGE = '0xA2c2CC61f1b6B7c16bEa554c435762Bc523eEB28'

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owners: [NATIVE_BRIDGE, USDC_BRIDGE],
      tokens: [ADDRESSES.null, ADDRESSES.ethereum.WETH, ADDRESSES.ethereum.USDC],
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owners: [NATIVE_BRIDGE],
      tokens: [ADDRESSES.null, ADDRESSES.bsc.WBNB],
    }),
  },
}
