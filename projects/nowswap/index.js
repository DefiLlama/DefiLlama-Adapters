
const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  ethereum: {
    tvl: getUniTVL({
      factory: '0xa556E2d77060A42516C9A8002E9156d8d3c832CE',
    })
  }
}