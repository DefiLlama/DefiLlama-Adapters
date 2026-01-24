const ADDRESSES = require('../helper/coreAssets.json')


const legacy_pools = {
  WETH: '0xc2c105e981F46a011D19511F8a118991663B136b',
  WBTC: '0x20D96638DA7B7e8FD7B78427EA49048d4A847946',
  USDC: '0x02434cD23972C82FbAbf610D157b41bFB45A45a3',
}

const pools = {
  USDC: '0xA4113Ac6Cc41141B819f34d81F6ccdabcA07AecF',
  WETH: '0x2839851d52e4dce3c714D199716b5f0fc9dbbaAa',
  WBTC: '0x6302e6683422cAFdC48fBA98309b559AABa95386',
}

const legacy_margin_account = '0x5c479762C8Fe57B6D874893a4B4932B40F612580'
const margin_account = '0x069cdfF47380bFcFa40D84f70834779DAaE96726'

async function tvl(api) {
  const tokensAndOwners = [
    [ADDRESSES.arbitrum.WETH, legacy_pools.WETH],
    [ADDRESSES.arbitrum.WBTC, legacy_pools.WBTC],
    [ADDRESSES.arbitrum.USDC, legacy_pools.USDC],
    [ADDRESSES.arbitrum.USDC_CIRCLE, legacy_pools.USDC],
    [ADDRESSES.arbitrum.USDC, legacy_margin_account],
    [ADDRESSES.arbitrum.USDC_CIRCLE, legacy_margin_account],
    [ADDRESSES.arbitrum.WETH, legacy_margin_account],
    [ADDRESSES.arbitrum.WBTC, legacy_margin_account],
    [ADDRESSES.arbitrum.USDC, pools.USDC],
    [ADDRESSES.arbitrum.WETH, pools.WETH],
    [ADDRESSES.arbitrum.WBTC, pools.WBTC],
    [ADDRESSES.arbitrum.USDC, margin_account],
    [ADDRESSES.arbitrum.WETH, margin_account],
    [ADDRESSES.arbitrum.WBTC, margin_account],
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
