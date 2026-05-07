const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// Nado on Ink Mainnet (Chain ID: 57073)
// Production deployment contract addresses
const inkConfig = {
  "querier": "0x68798229F88251b31D534733D6C4098318c9dff8",
  "clearinghouse": "0xD218103918C19D0A10cf35300E4CfAfbD444c5fE",
  "endpoint": "0x05ec92D78ED421f3D3Ada77FFdE167106565974E",
  "spotEngine": "0xFcD94770B95fd9Cc67143132BB172EB17A0907fE",
  "perpEngine": "0xF8599D58d1137fC56EcDd9C16ee139C8BDf96da1"
}

module.exports = {
  ink: {
    tvl: sumTokensExport({
      owners: [inkConfig.clearinghouse, inkConfig.endpoint],
      tokens: [ADDRESSES.ink.USDT0, ADDRESSES.ink.WETH, ADDRESSES.ink.KBTC, ADDRESSES.ink.USDC],
    })
  }
}
