const { STHYPE, readRestaking } = require('../helper/valantis')

module.exports = {
  start: '2026-09-29',
  methodology: 'Counts active user stHYPE plus pending withdrawals in the restaking escrow. Excludes unreleased reward reserves and the permanent seed. stHYPE and wstHYPE represent the same shares and are counted once.',
  hyperliquid: {
    tvl: async (api) => api.add(STHYPE, (await readRestaking(api)).toString()),
  },
}
