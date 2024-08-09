const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const WETHUSDC = "0x501B03BdB431154b8Df17BF1c00756E3a8F21744"
const WBTCUSDC = "0x550e7E236912DaA302F7d5D0d6e5D7b6EF191f04"
const ARBUSDC = "0x4eed3A2b797Bf5630517EcCe2e31C1438A76bb92"

async function tvl(api) {
  return sumTokens2({ tokens: [nullAddress, ADDRESSES.arbitrum.WETH, ADDRESSES.arbitrum.USDC, ADDRESSES.arbitrum.WBTC, ADDRESSES.arbitrum.ARB], owners: [WETHUSDC, WBTCUSDC, ARBUSDC], api })
}

module.exports = {
  methodology: `We count the Tokens on ${WETHUSDC, WBTCUSDC, ARBUSDC}`,
  arbitrum: {
    tvl
  }
}