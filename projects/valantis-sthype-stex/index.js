const { STHYPE, WHYPE, DEPLOYMENTS, readStex } = require('../helper/valantis')

const STEX = '0x39694eFF3b02248929120c73F90347013Aec834d'

module.exports = {
  start: '2025-04-02',
  methodology: 'Counts net stHYPE STEX LP assets, including lending and pending unstaking, less LP withdrawal liabilities. Preserves live stHYPE exposure for parent-level exclusions; liabilities reduce native exposure first.',
  hyperliquid: {
    tvl: async (api) => {
      const { liveStHype, native } = await readStex(api, STEX, DEPLOYMENTS.sthypeStex)
      api.add(STHYPE, liveStHype.toString())
      api.add(WHYPE, native.toString())
    },
  },
}
