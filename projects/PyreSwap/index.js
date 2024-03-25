const { getUniTVL } = require('../helper/unknownTokens');

module.exports = {
  misrepresentedTokens: true, 
};

['fantom', 'bsc', 'avax'].forEach(chain => {
  module.exports[chain] = {
    tvl: getUniTVL({ factory: '0x045d720873f0260e23da812501a7c5930e510aa4', useDefaultCoreAssets: true, fetchBalances: true, })
  }
})