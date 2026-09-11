const { getUniTVL } = require('../helper/unknownTokens')

const factory = '0x709e3C6b22993189327a8CFebD572b6cc459fe40'

module.exports = {
  methodology: 'Counts liquidity across all PlaxSwap LPs',
}

module.exports.polygon = {
  tvl: getUniTVL({
    factory,
  }),
}