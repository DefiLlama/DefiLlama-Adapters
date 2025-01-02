const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  ethpow: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0x8cF9A887e53be909C221A2708E72898546dAB7Cc',
    })
  }
};