const { getUniTVL} = require("../helper/unknownTokens")

module.exports = {
  era: {
    tvl: getUniTVL({ factory: '0xea51CE8A1f9C1Cbbf5B89D9B1dA4A94fB1557866', })
  },
}
