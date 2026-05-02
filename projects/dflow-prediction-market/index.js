const { sumTokensExport } = require('../helper/solana')

const TREASURIES = [
  'C6tLX41pT7ke9LtJ25cdhzPxVbngWD6KsDaEFTSC4SKE',
  '82TCjUf5YjrbJro4XdEfeCokvpQrNUntD97Zjrip8knr',
]

module.exports = {
  solana: {
    tvl: sumTokensExport({ tokenAccounts: TREASURIES, }),
  },
}
