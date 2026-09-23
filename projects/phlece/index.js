const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Phlece launchpad on Arc: every bonding-curve token's USDC reserve is held
// directly by the factory contract (verified 2026-09-22, exact match on
// Sourcify/Arcscan: https://arc-scan.org/address/0x955805EfAa04cb1d32eE465e3281aB0EEBAF8090)
// -- there is no per-token vault or LP position pre-graduation, so TVL is
// simply the factory's own USDC balance across every active curve.
// Post-graduation, a token's liquidity moves into a Uniswap V4 pool and its
// LP position is transferred to PhleceLPLocker (also verified, exact match:
// https://arc-scan.org/address/0x424F530A9947EAD606402E8F2CC52142c85f31A6),
// which has no withdrawal function under any caller.
const FACTORY = '0x955805efaa04cb1d32ee465e3281ab0eebaf8090'
const LP_LOCKER = '0x424f530a9947ead606402e8f2cc52142c85f31a6'

module.exports = {
  methodology: 'TVL is the USDC held directly by the PhleceCurveFactory contract across all active bonding curves, plus the USDC side of graduated tokens\' Uniswap V4 LP positions permanently held in PhleceLPLocker.',
  arc: {
    tvl: (api) => sumTokens2({ api, owners: [FACTORY, LP_LOCKER], tokens: [ADDRESSES.arc.USDC] }),
  },
}
