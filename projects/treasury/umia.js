const { treasuryTvl, treasuryOwnTokens, PROTOCOL_VENTURE_ID } = require('../helper/umia')

module.exports = {
  methodology:
    "Umia's own treasury (venture 7), which is also the protocol fee recipient: raised capital in USDC as treasury value, and the UMIA it holds reported separately as own tokens. Treasuries of the ventures launched on Umia are tracked by the Umia Venture Treasuries adapter, so the two never overlap. Vault LP shares are not counted -- they are a receipt for liquidity already reported as TVL.",
  base: {
    tvl: treasuryTvl({ only: PROTOCOL_VENTURE_ID }),
    ownTokens: treasuryOwnTokens({ only: PROTOCOL_VENTURE_ID }),
  },
}
