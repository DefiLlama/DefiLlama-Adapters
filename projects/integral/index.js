const sdk = require('@defillama/sdk')
const { getUniTVL } = require('../helper/unknownTokens')
const getReservesABI = require('./abis/sizeGetReserves.json')

const fiveTVL = getUniTVL({ factory: '0x673662e97b05e001816c380ba5a628d2e29f55d1' })
const sizeTVL = getUniTVL({ factory: '0xC480b33eE5229DE3FbDFAD1D2DCD3F3BAD0C56c6', abis: { getReservesABI } })

module.exports = {
  ethereum: {
    tvl: sdk.util.sumChainTvls([fiveTVL, sizeTVL])
  },
};
