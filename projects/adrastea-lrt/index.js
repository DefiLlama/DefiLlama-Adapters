const { sumTokensExport } = require('../helper/solana')
module.exports = {
  doublecounted: true,
  solana: {
    tvl: sumTokensExport({ owners: ['wYPqKV6XuRBSBU1zYiYB1ZTPhkR8PsDRz5kKgmSyum1'] })
  }
}
