const { sumTokensExport } = require('../helper/unwrapLPs')

// Base USDC, the only asset the escrow holds.
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'

// Every ReferralEscrow deployment on Base mainnet. A redeploy leaves the previous
// escrow draining or archived; claims in flight settle there, so it stays listed.
const ESCROWS = [
  '0xa9f96c74230810205023c3E3AFEe33d3151e5Ee8', // first mainnet escrow, archived
  '0xA4bFddBc6Bb8F589a92A4d4595c6902e95eb9a38', // live
]

module.exports = {
  methodology: 'USDC held by the ref_market ReferralEscrow contracts on Base: rewards, protocol fees and dispute stakes escrowed for open offers and claims in flight, plus settled balances not yet withdrawn.',
  base: { tvl: sumTokensExport({ owners: ESCROWS, tokens: [USDC] }) },
}
