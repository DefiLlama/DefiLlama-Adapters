const { sumTokensExport } = require('../helper/unwrapLPs')

const ark = "0x3B065b08AAe6e29972058096cfA77E196590784a"
const insuranceFund = "0x80ce46804010C03387a13E27729c5FBb6a309105"
const clearingHouse = "0xBFB083840b0507670b92456264164E5fecd0430B"
const usdcAvalanche = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"

module.exports = {
  avax: {
    tvl: sumTokensExport({
      owners: [insuranceFund, clearingHouse, ark,],
      tokens: [usdcAvalanche],
      chain: 'avax',
    })
  }
}
