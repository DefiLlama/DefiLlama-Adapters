const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking.js');

const factory = '0x2CdFB20205701FF01689461610C9F321D1d00F80'
const tethys = '0x69fdb77064ec5c84FA2F21072973eB28441F43F3'
const masterchef = '0x54A8fB8c634dED694D270b78Cb931cA6bF241E21'

module.exports = {
  methodology: `Metis tokens, USDC, USDT, WETH, TETHYS allocated in LP`,
  misrepresentedTokens: true,
  metis:{
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true }),
    staking: staking(masterchef, tethys),
  }
}
