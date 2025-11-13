const ADDRESSES = require('../helper/coreAssets.json')

const pools = {
  WETH: '0xc2c105e981F46a011D19511F8a118991663B136b',
  WBTC: '0x20D96638DA7B7e8FD7B78427EA49048d4A847946',
  USDC: '0x02434cD23972C82FbAbf610D157b41bFB45A45a3',
}

const marginAccount = '0x5c479762C8Fe57B6D874893a4B4932B40F612580'

async function tvl(api) {
  const tokensAndOwners = [
    [ADDRESSES.arbitrum.WETH, pools.WETH],
    [ADDRESSES.arbitrum.WBTC, pools.WBTC],
    [ADDRESSES.arbitrum.USDC, pools.USDC],
    [ADDRESSES.arbitrum.USDC_CIRCLE, pools.USDC],
    [ADDRESSES.arbitrum.USDC, marginAccount],
    [ADDRESSES.arbitrum.USDC_CIRCLE, marginAccount],
    [ADDRESSES.arbitrum.WETH, marginAccount],
    [ADDRESSES.arbitrum.WBTC, marginAccount],
  ]
  
  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  start: 385225783,
  methodology: 'Sums tokens supplied to liquidity pools and assets stored in margin accounts.',
  arbitrum: {
    tvl,
  }
}
