const { sumTokensExport } = require('../helper/solana')

module.exports = {
  solana: {
    tvl: sumTokensExport({ solOwners: ['GwXEzAYMQkZJr2VgiPfp5BtJoh7tBuFhM7djkMNzAiTT'] }),
  },
}