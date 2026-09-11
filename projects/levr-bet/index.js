const { sumTokensExport } = require("../helper/unknownTokens")
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  methodology:
    "TVL is the USDC held in the LevrMvpDepository vault on Monad, which backs the bankroll (counterparty pool) for Levr Bet's leveraged sports prediction markets. The protocol is currently in a pre-launch   deposit phase where USDC deposits mint $MVP at a fixed $1.00.",
  monad: {
    tvl: sumTokensExport({
      owners: ['0x141B1d9Ebd2E21749d6425CaeBaCc9704aAb9583'],
      tokens: [ADDRESSES.monad.USDC],
    }),
  }
}