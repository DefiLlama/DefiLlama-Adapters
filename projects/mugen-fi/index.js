const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

// Deposits were forwarded by the Treasury contract to the team treasury wallet
// (treasury()). reserveBalance() is only a deposit counter - it has been frozen
// at ~3.35M since 2023-11-15 while the treasury was emptied on 2023-11-28, so we
// count the actual token balances instead.
const TREASURY_CONTRACT = '0xf7be8476ae27d27ebc236e33020150b23a86f3dd'
const TREASURY_WALLET = '0x00236173844ac7f7091d69d6cbf7e0430222296e'

module.exports = {
  doublecounted: true,
  arbitrum: {
    tvl: sumTokensExport({
      owners: [TREASURY_CONTRACT, TREASURY_WALLET],
      tokens: [
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.USDC_CIRCLE,
        ADDRESSES.arbitrum.USDT,
        ADDRESSES.arbitrum.WETH,
        ADDRESSES.arbitrum.DAI,
      ],
    }),
    staking: staking('0x25b9f82d1f1549f97b86bd0873738e30f23d15ea', '0xfc77b86f3ade71793e1eec1e7944db074922856e')
  }
}
