const { treasuryTvl, treasuryOwnTokens, PROTOCOL_VENTURE_ID } = require('../helper/umia')

// Umia's own venture (7) is reported on the parent's treasury tab instead.
const FIRST_LAUNCHED_VENTURE_ID = PROTOCOL_VENTURE_ID + 1

module.exports = {
  methodology:
    "Treasuries of every venture launched on Umia, enumerated from the Umia hub so a new venture is picked up without a code change: raised capital in the venture's money token as treasury value, and each venture's own token reported separately as own tokens. Umia's own treasury (venture 7) is reported on the Umia parent instead, so the two never overlap.",
  base: {
    tvl: treasuryTvl({ from: FIRST_LAUNCHED_VENTURE_ID }),
    ownTokens: treasuryOwnTokens({ from: FIRST_LAUNCHED_VENTURE_ID }),
  },
}
