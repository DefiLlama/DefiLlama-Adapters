const { sumTokensExport } = require('../helper/solana')

module.exports = {
  solana: {
    // program: HVdfohHjp1kZwxn123Cxv3GDeXeXnLM1RAXaF8dPYBdS
    tvl: sumTokensExport({ solOwners: ['GwXEzAYMQkZJr2VgiPfp5BtJoh7tBuFhM7djkMNzAiTT'] }),
  },
}