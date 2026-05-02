const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

const whbtc = "0xf19c3FAFB0171484d2301Af1838cB5C6Ea739dC4"
const wheth = "0x33827D2d2a0f4533AC26083E6eaAe71D417cbBA0"
const writeUSDC = "0xda0606037834f4279Dc590434231F1E01C468629"

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [ADDRESSES.ethereum.WBTC, whbtc],
        [ADDRESSES.ethereum.WETH, wheth],
        [ADDRESSES.ethereum.USDC, writeUSDC],
      ]
    })
  },
}