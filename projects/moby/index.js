const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  hallmarks: [
    [1736294400,"Private-key Leak Exploit"]
  ],
  arbitrum: {
    tvl: sumTokensExport({ 
      owners: [
        "0x157CF8715b8362441669f8c89229bd6d4aa3EE92", // s vault
        "0x0DB7707a3188D28300f97E3c4a513630106eD192", // m vault
        "0x8aBd3F9a4047FB959F3089744DBaAec393aD2e09", // l vault
      ], 
      tokens: [
        ADDRESSES.arbitrum.WETH,
        ADDRESSES.arbitrum.USDC_CIRCLE,
        ADDRESSES.arbitrum.WBTC,
      ]
    })
  }
}