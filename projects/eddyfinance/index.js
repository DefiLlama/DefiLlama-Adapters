const { getUniTVL } = require('../helper/unknownTokens')
const getReserves = 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1)'

const zetaTVL = getUniTVL({ factory: '0x9fd96203f7b22bCF72d9DCb40ff98302376cE09c', abis: { getReserves } })

module.exports = {
  zeta: { tvl: zetaTVL },
};