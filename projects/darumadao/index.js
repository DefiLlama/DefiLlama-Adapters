const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk")
const { default: BigNumber } = require("bignumber.js")
const { toUSDTBalances } = require('../helper/balances')

const chain = 'godwoken'
const STAKING_ADDRESS = '0x31A7D9c604C87F7aA490A350Ef8DF170dC2233AA'
const DRM_ADDRESS = '0x81E60A955DC8c4d25535C358fcFE979351d102B5'
const USDC_ADDRESS = ADDRESSES.godwoken.USDC
const DRM_USDC_LP_ADDRESS = '0x268aaeed47d031751db1cbba50930fe2991f0ed0'

async function tvl(ts, _block, chainBlocks) {
  const block = chainBlocks[chain]
  const [
    { output: drmTokensStaked },
    { output: drmTokensLP },
    { output: usdcTokensLP },
    { output: usdcDecimals },
    { output: drmDecimals },
  ] = await Promise.all([
    sdk.api.erc20.balanceOf({ owner: STAKING_ADDRESS, target: DRM_ADDRESS, block, chain }),
    sdk.api.erc20.balanceOf({ owner: DRM_USDC_LP_ADDRESS, target: DRM_ADDRESS, block, chain }),
    sdk.api.erc20.balanceOf({ owner: DRM_USDC_LP_ADDRESS, target: USDC_ADDRESS, block, chain }),
    sdk.api.erc20.decimals(USDC_ADDRESS, chain),
    sdk.api.erc20.decimals(DRM_ADDRESS, chain),
  ])

  const tokenPrice = BigNumber(usdcTokensLP).dividedBy(10 ** usdcDecimals).multipliedBy(10 ** drmDecimals).dividedBy(drmTokensLP)
  return toUSDTBalances(BigNumber(drmTokensStaked).multipliedBy(tokenPrice).dividedBy(10 ** drmDecimals).toFixed(0))
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `Finds TVL by querying DRM contract for sDRM (Staked DRM) supply and the DRM price. TVL = sdrmSupply * drmPrice`,
  godwoken: {
    tvl: async ()=>({}),
    staking: tvl,
  }
}