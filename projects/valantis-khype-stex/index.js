const { WHYPE, DEPLOYMENTS, readStex } = require('../helper/valantis')

const STEX = '0xbf747D2959F03332dbd25249dB6f00F62c6Cb526'

module.exports = {
  start: '2025-07-07',
  methodology: 'Counts net kHYPE STEX LP assets in redeemable HYPE units, including lending and pending unstaking, less LP withdrawal liabilities. Includes residual assets while the AMM is withdrawal-only.',
  hyperliquid: {
    tvl: async (api) => {
      const { nav } = await readStex(api, STEX, DEPLOYMENTS.khypeStex)
      api.add(WHYPE, nav.toString())
    },
  },
}
