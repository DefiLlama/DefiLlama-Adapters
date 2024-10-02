const { getUniTVL } = require('../helper/unknownTokens');

const FACTORY_ETHEREUM = '0x115934131916c8b277dd010ee02de363c09d037c';
const FACTORY_SHIBARIUM = '0xc2b4218F137e3A5A9B98ab3AE804108F0D312CBC';

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: getUniTVL({
      factory: FACTORY_ETHEREUM,
      useDefaultCoreAssets: true,
      blacklist: [
        '0x6ADb2E268de2aA1aBF6578E4a8119b960E02928F', 
        '0xab167E816E4d76089119900e941BEfdfA37d6b32', 
        '0xF33893DE6eB6aE9A67442E066aE9aBd228f5290c', 
        '0x84FA8f52E437Ac04107EC1768764B2b39287CB3e',
        '0x7121D00b4fA18F13Da6c2e30d19C04844E6AfDC8',
        '0xC1bfcCd4c29813eDe019D00D2179Eea838a67703'
      ],
    })
  },
  shibarium: {
    tvl: getUniTVL({
      factory: FACTORY_SHIBARIUM,
      useDefaultCoreAssets: true,
    })
  }
};
