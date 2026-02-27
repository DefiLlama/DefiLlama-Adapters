const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// BBBEscrow — trustless USDC escrow contract with Pyth Entropy VRF winner selection.
// All player USDC deposits go directly to this contract. No withdraw() function exists —
// funds can only leave via VRF-determined winner payouts.
// Verified: https://basescan.org/address/0x6d62b69069eb3db1e414331b75516341e5a606a7
const ESCROW_CONTRACT = '0x6d62b69069eb3db1e414331b75516341e5a606a7'

module.exports = {
  methodology: 'TVL is the USDC held in the BBBEscrow smart contract on Base. Players deposit USDC to buy tiles; the contract holds deposits as the active prize pool. Winner selection uses Pyth Entropy (on-chain verifiable randomness). No withdraw() function exists — funds can only leave via VRF-determined payouts.',
  start: '2026-02-04',
  base: {
    tvl: sumTokensExport({
      owners: [ESCROW_CONTRACT],
      tokens: [ADDRESSES.base.USDC],
    }),
  },
}
