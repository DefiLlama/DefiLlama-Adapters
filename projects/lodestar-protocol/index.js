// DefiLlama TVL adapter for Lodestar (Flare).
//
// NOT the same protocol as `projects/lodestar` / `projects/lodestar-v1`, which are Lodestar Finance,
// a Compound fork on Arbitrum. This is an unrelated protocol on Flare with a different team,
// different contracts and a different design. The slug is `lodestar-protocol` after the project's
// domain (lodestarprotocol.xyz) precisely to keep the two apart.
//
// Lodestar is no-liquidation, fixed-term lending on Flare: lock yield-bearing collateral
// (FXRP, sFLR, stXRP), borrow USDT0 at a tier LTV, repay by a deadline. Only the calendar
// can default a loan; price never liquidates.
//
// TVL      = idle USDT0 in the LodestarPool + collateral (FXRP, sFLR, stXRP) locked in the
//            LodestarLoanBook + the first-loss reserve buffer (USDT0) held in the book.
// Borrowed = outstanding USDT0 loaned to borrowers (pool.principalOut). That USDT0 sits in
//            borrowers' wallets, so it is NOT part of TVL, only reported as `borrowed`.
//
// sumTokensExport reads the on-chain balances the two contracts actually hold, so principal
// that is lent out correctly drops out of TVL automatically.

const { sumTokensExport } = require('../helper/unwrapLPs')

// ---- Flare mainnet deployment, genesis 2026-08-29 (block 68517390) ----
const POOL = '0x87b09bE7A253C2af187c9af17cDEDcEAf4A9780E' // LodestarPool
const BOOK = '0x9b479f47ef25E0Ed2134F38d3c4e1022A8695ed8' // LodestarLoanBook

// ---- verified Flare mainnet token addresses (fork-proven in the audit) ----
const USDT0 = '0xe7cd86e13AC4309349F30B3435a9d337750fC82D' // 6dp  - pool asset / borrow currency
const FXRP = '0xAd552A648C74D49E10027AB8a618A3ad4901c5bE' //  6dp  - XRP (FAssets)
const SFLR = '0x12e605bc104e93B45e1aD99F9e555f659051c2BB' // 18dp  - Sceptre staked FLR (LST)
const STXRP = '0x4c18ff3c89632c3dd62e796c0afa5c07c4c1b2b3' //  6dp  - Firelight staked XRP (LST)

const tokens = [USDT0, FXRP, SFLR, STXRP]

async function borrowed(api) {
  const principalOut = await api.call({ target: POOL, abi: 'uint256:principalOut' })
  api.add(USDT0, principalOut)
}

module.exports = {
  methodology:
    'TVL counts USDT0 supplied to the LodestarPool plus collateral (FXRP, sFLR, stXRP) locked in the ' +
    'LodestarLoanBook and its first-loss reserve buffer. Borrowed is the outstanding USDT0 loaned to ' +
    'borrowers (pool.principalOut), reported separately from TVL.',
  start: "2026-08-29",
  flare: {
    tvl: sumTokensExport({ owners: [POOL, BOOK], tokens }),
    borrowed,
  },
}
