const { getUniTVL } = require('../helper/unknownTokens')
const { stakingPriceLP } = require("../helper/staking");

const STAKING_ADDR = "0x1b7BCea38FA123236CfF7D0F944e01F501842123"
const VAN_ADDR = "0xa3cFA732c835233db3d6bf5f4A3c2D45b02Eb6B9"
const USDT_VAN_LP = "0x1e0583bc7D49b693277Cc7E0F6af1A0bdB56e9D8"


module.exports = {
  misrepresentedTokens: true,
  vision: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0xF6D67482DEDE4D208F74CCD0E6592764014F546F',
    }),
    staking: stakingPriceLP(STAKING_ADDR, VAN_ADDR, USDT_VAN_LP, "tether") 
    
  }
}; 