const { getUniTVL } = require('../helper/unknownTokens')
const { deadFrom } = require('../mosquitos-finance')

module.exports = {
  misrepresentedTokens: true,
  hallmarks: [
    [1671062400, "Rug Pull"]
  ],
  deadFrom: 1671062400,
  echelon: {
    tvl: () => ({}),
  }
}