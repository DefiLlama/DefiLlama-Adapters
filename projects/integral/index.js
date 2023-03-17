const sdk = require('@defillama/sdk')
const { getUniTVL } = require('../helper/unknownTokens')
const getReserves = 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1)'

const sizeTVL = getUniTVL({ factory: '0xC480b33eE5229DE3FbDFAD1D2DCD3F3BAD0C56c6', abis: { getReserves } })

module.exports = {
  ethereum: {
    tvl: sdk.util.sumChainTvls([sizeTVL])
  },
};
