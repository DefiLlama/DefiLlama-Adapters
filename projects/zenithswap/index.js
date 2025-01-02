const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

const MASTER_CHEF = '0xa3b19C3aFD545900B778Cc7B3e2dC35848672aC2'
const ZSP_TOKEN = '0xb2dcbd5258a22385240e4ac13fc6726b66f0de96'

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x8F086a081621bbc13B6d02A9e1123212CF07fdf8) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    arbitrum: {
    tvl: getUniTVL({ factory: '0x8F086a081621bbc13B6d02A9e1123212CF07fdf8', useDefaultCoreAssets: true }),
    staking: staking( MASTER_CHEF, ZSP_TOKEN)
  },
};