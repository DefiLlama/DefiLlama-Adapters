const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

/**
 * HRUSD — USD-pegged stablecoin on Base, minted 1:1 against USDC through a Peg
 * Stability Module, with an incentivised HRUSD/USDC Uniswap V3 LP program.
 */

const USDC = ADDRESSES.base.USDC

/** PSM: users deposit USDC here and the operator mints HRUSD 1:1 against it. */
const PSM = '0xe5545fd5e48425663Bf207183a868Eb0A1d2b9ee'

/**
 * V3LPStakingRewards deployments. Both escrow Uniswap V3 HRUSD/USDC position
 * NFTs; the first is the legacy contract users are migrating away from, the
 * second is the current one. Positions exist in both while the migration runs.
 */
const STAKING = [
  '0xb72f376ae7732a76F1C18e0547553A616a33a2bd',
  '0xA61C08DeC414416E55de7b4510bA8Ef25C89886a',
]

/**
 * On-chain USDC reserve of the PSM. The module keeps a liquid buffer
 * (`bufferBps()`) here; the rest of the backing is custodied off-chain, so this
 * counts only what is measurable on Base.
 */
const tvl = async (api) => api.sumTokens({ owner: PSM, tokens: [USDC] })

/**
 * HRUSD/USDC Uniswap V3 positions staked in the LP reward contracts, unwrapped
 * to their underlying token amounts.
 */
const pool2 = async (api) => sumTokens2({ api, owners: STAKING, resolveUniV3: true })

module.exports = {
  methodology:
    'TVL counts the USDC reserve held on-chain by the HRUSD Peg Stability Module (0xe5545fd5e48425663Bf207183a868Eb0A1d2b9ee). Pool2 counts the Uniswap V3 HRUSD/USDC liquidity positions escrowed in the two V3LPStakingRewards contracts, unwrapped to their underlying USDC and HRUSD amounts. The remainder of the HRUSD backing is custodied on a centralised exchange and is deliberately not counted here.',
  start: '2026-04-24', // PSM deployed at Base block 45094158
  base: { tvl, pool2 },
}
