const {getUniTVL} = require('../helper/unknownTokens')

const FACTORY = '0x115934131916c8b277dd010ee02de363c09d037c';

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: getUniTVL({
      factory: FACTORY,
      chain: 'ethereum',
      blacklist: ['0x6ADb2E268de2aA1aBF6578E4a8119b960E02928F', '0xab167E816E4d76089119900e941BEfdfA37d6b32'],
    })
  }
}; 