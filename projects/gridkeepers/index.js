/**
 * GridKeepers — DeFiLlama Adapter
 *
 * Tracks TVL for the GridKeepers RWA protocol on Robinhood Chain.
 *
 * Contract addresses (verified on Blockscout):
 *   NFT:              0x24D05CA17EaE6D11B0F4825f6203Eb1d0A397E87
 *   GRIDKEEPERS:      0x30627c0b6267A11a6d58166cfB2826DAc53DC719
 *   EmploymentVault:  0x062a3746C826F5BEFd85A28f69A267d2E28D4aC5
 *   RwaRewards:       0x3F9E4D3174F40B1A6Fe949912800004a6c8BBC1c
 *   RevenueVault:     0x447D693Ff0868b698f0d62060B87bb178A41f1c6
 *   RwaAcquisition:   0x8A534f10c352d00D495C9F80C9492e8Ae7FEBb02
 *
 * Notes:
 *   - EmploymentVault does NOT hold GRIDKEEPERS tokens. Each employ burns
 *     100K GRIDKEEPERS to the dead address (0x000…dEaD). Burned tokens
 *     leave circulating supply and are excluded from TVL.
 *   - RWA reward tokens (USDG, NVDA, SPCX, TSLA, AAPL) will appear in
 *     TVL once pools receive real funding.
 *   - Revenue Vault receives native ETH from protocol fees; ETH is
 *     routed to Acquisition for reward purchases.
 */

const REWARDS = '0x3F9E4D3174F40B1A6Fe949912800004a6c8BBC1c'
const REVENUE_VAULT = '0x447D693Ff0868b698f0d62060B87bb178A41f1c6'

const RWA_TOKENS = [
  '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168', // USDG
  '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC', // NVDA
  '0x4a0E65A3EcceC6dBe60AE065F2e7bb85Fae35eEa', // SPCX
  '0x322F0929c4625eD5bAd873c95208D54E1c003b2d', // TSLA
  '0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9', // AAPL
]

async function tvl(api) {
  // Native ETH in Revenue Vault (from protocol fees, routed to Acquisition)
  const ethBalance = await api.getBalance(REVENUE_VAULT)
  if (ethBalance > 0n) api.addGasToken(ethBalance)

  // RWA reward tokens held in Rewards contract (populated after pool funding)
  await api.sumTokens({ owners: [REWARDS], tokens: RWA_TOKENS })
}

module.exports = {
  methodology: 'TVL includes native ETH in Revenue Vault and RWA reward tokens (USDG, NVDA, SPCX, TSLA, AAPL) held in the Rewards contract. EmploymentVault holds no tokens — each employ burns 100K GRIDKEEPERS to the dead address, removing them from supply rather than locking them.',
  misrepresentedTokens: false,
  start: '2026-06-09',
  timetravel: false,
  doublecounted: false,
  robinhood: { tvl },
}
