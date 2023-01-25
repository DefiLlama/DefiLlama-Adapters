const { sumTokensExport, } = require('../helper/unwrapLPs')

const DAI = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'

const oldDaoContract = '0xb05d0da5253e77a8ad37232e8235c712e10edee8'
const daoContract = '0xb8dc6634b7ac8ad3ae352ab92de51349e7b5e71c'

module.exports = {
  polygon: {
    tvl: sumTokensExport({
      owners: [oldDaoContract, daoContract,],
      tokens: [DAI],
    }),
  },
  methodology: `TVL on polygon is sum of all collateralTokens (dai only atm) provided to mint nodes`,
}
