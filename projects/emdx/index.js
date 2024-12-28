const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const ark = "0x3B065b08AAe6e29972058096cfA77E196590784a"
const insuranceFund = "0x80ce46804010C03387a13E27729c5FBb6a309105"
const clearingHouse = "0xBFB083840b0507670b92456264164E5fecd0430B"
const usdcAvalanche = ADDRESSES.avax.USDC

module.exports = {
  avax: {
    tvl: sumTokensExport({
      owners: [insuranceFund, clearingHouse, ark,],
      tokens: [usdcAvalanche],
      chain: 'avax',
    })
  }
}
