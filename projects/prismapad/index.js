const ADDRESSES = require('../helper/coreAssets.json')

// Prismapad launchpad on Stable (chain id 988). Verified source:
// https://stablescan.xyz/address/0xdcb881fc8b472eb7797687b237e6cb123c425ff7#code
const LAUNCHPAD = '0xdcb881fc8b472eb7797687b237e6cb123c425ff7'

module.exports = {
  methodology:
    'TVL is the USDT0 held by the Prismapad launchpad contract: the bonding-curve reserves of every launched token plus trade fees accrued to creators and the protocol until claimed.',
  start: '2026-07-23',
  stable: {
    tvl: (api) => api.sumTokens({ owner: LAUNCHPAD, tokens: [ADDRESSES.stable.USDT0] }),
  },
}
