const { sumTokensExport } = require('../helper/solana')
module.exports = {
  solana: {
    tvl: sumTokensExport({ owners: ['Ec5tJ1H24iVSM2L8Yd7SHf7bjtD7FUWDiYSeESpFYynM'] })
  }
}
