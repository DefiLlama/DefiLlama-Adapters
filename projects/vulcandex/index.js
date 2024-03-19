const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x293f45b6F9751316672da58AE87447d712AF85D7)",
  polygon: {
    tvl: getUniTVL({ factory: '0x293f45b6F9751316672da58AE87447d712AF85D7', chain: 'polygon', useDefaultCoreAssets: true }),
  },
 
}; //For some reason, the built-in module functions are not receiving the PYR token and its pools. Manually adding the token?