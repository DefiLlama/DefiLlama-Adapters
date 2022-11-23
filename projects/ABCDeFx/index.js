const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  xdai:     { tvl: getUniTVL({ chain: 'xdai',     factory: '0xbBD6e78961b13498F313883632D315ebD4Adbd6D',  useDefaultCoreAssets: true, }) },
  echelon:  { tvl: getUniTVL({ chain: 'echelon',  factory: '0xbBD6e78961b13498F313883632D315ebD4Adbd6D',  useDefaultCoreAssets: true, }) },
};
