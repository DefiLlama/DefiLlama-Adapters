const { gmxExports } = require('../helper/gmx')

module.exports = {
  arbitrum: {
    tvl: gmxExports({ chain: 'arbitrum', vault: '0xDfbA8AD57d2c62F61F0a60B2C508bCdeb182f855', })
  },
}