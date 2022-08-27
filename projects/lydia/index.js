const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  avax:{
    tvl: getUniTVL({ chain: 'avax', factory: '0xe0C1bb6DF4851feEEdc3E14Bd509FEAF428f7655', })
  },
}
