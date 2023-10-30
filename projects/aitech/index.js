const { getUniTVL } = require('../helper/unknownTokens.js')
const { staking } = require("./helper/staking.js");

const aitechStakingContract = '0x2C4dD7db5Ce6A9A2FB362F64fF189AF772C31184'
const aitechTokenContract = '0x2D060Ef4d6BF7f9e5edDe373Ab735513c0e4F944'

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      factory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
      useDefaultCoreAssets: true,
      hasStablePools: true,
      fetchBalances: true,
      chain: 'bsc'
    }),
    staking: staking(aitechStakingContract, aitechTokenContract, "aitech")
  }
}