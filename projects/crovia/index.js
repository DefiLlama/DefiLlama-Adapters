/**
 * Crovia — TVL adapter (Cronos).
 *
 * Drop-in for github.com/DefiLlama/DefiLlama-Adapters at `projects/crovia/index.js`.
 *
 * NOTE: Crovia is an NFT marketplace + aggregator, so it has little fungible TVL.
 * Its primary DefiLlama listing is the fees/aggregator dimension adapters
 * (real on-chain trading fees). This TVL adapter is OPTIONAL: it reports the
 * native CRO reward reserve held by the NFT staking pool, which backs staking
 * rewards. The staked assets themselves are NFTs (not priced here). If a reviewer
 * prefers Crovia be listed fees-only, this file can be dropped — the fees adapter
 * still creates the protocol page.
 */
const ADDRESSES = require('../helpers/coreAssets.json')
const { sumTokens2 } = require('../helpers/unwrapLPs')

// CroviaStakingPool — rewardToken is native CRO (0x000..0); deployed 2026-05-14.
const STAKING_POOL = '0xb396e08ceca0f1bea3c120b21dc2c9ed6e25d7d4'

async function staking(api) {
  // Native CRO held by the staking pool (the reward reserve).
  return sumTokens2({ api, owner: STAKING_POOL, tokens: [ADDRESSES.null] })
}

module.exports = {
  methodology:
    'Native CRO reward reserve held by the CroviaStakingPool that backs NFT-staking rewards. Staked assets are NFTs and are not priced.',
  start: '2026-05-14',
  cronos: {
    tvl: () => ({}),
    staking,
  },
}
