const { sumTokensExport } = require('../helper/solana')

const TOKENS = [
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH',
]

const TREASURIES = [
  'C6tLX41pT7ke9LtJ25cdhzPxVbngWD6KsDaEFTSC4SKE',
  '82TCjUf5YjrbJro4XdEfeCokvpQrNUntD97Zjrip8knr',
]

module.exports = {
  solana: {
    tvl: sumTokensExport({
      owners: TREASURIES,
      tokens: TOKENS,
    }),
  },
}
