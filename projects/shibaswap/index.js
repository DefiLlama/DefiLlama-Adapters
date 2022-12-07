const {getUniTVL} = require('../helper/unknownTokens')

const FACTORY = '0x115934131916c8b277dd010ee02de363c09d037c';

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: getUniTVL({
      factory: FACTORY,
      chain: 'ethereum',
      useDefaultCoreAssets: true,
    })
  }
}; 