const { sumTokens2 } = require('../helper/unwrapLPs')

const BTC_RESERVE_VAULT = "0x4eFDA2509fc24dCCf6Bc82f679463996993B2b4a"
const TBTC = "0x236aa50979D5f3De3Bd1Eeb40E81137F22ab794b"

module.exports = {
  methodology: "Counts total tBTC locked in BTCReserveVault contract",
  base: {
    tvl: async (api) => {
      return sumTokens2({
        api,
        tokens: [TBTC],
        owners: [BTC_RESERVE_VAULT],
      })
    },
  },
}
