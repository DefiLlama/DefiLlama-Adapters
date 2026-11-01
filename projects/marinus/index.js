/**
 * Marinus Protocol — Harmony Finance TVL adapter for DefiLlama-Adapters.
 *
 * NOT connected to DeFiLlama from this repo. Copy this folder into
 * https://github.com/DefiLlama/DefiLlama-Adapters/tree/main/projects/marinus
 * and open a PR when ready to list. Rename *.cjs → *.js in that repo (CJS).
 *
 * TVL methodology matches the Marinus frontend:
 * - Lending: mPool total supplied (active mToken supply × exchange rate, minus burn address)
 * - Staking: ValidatorStakingPool + StablecoinRewardStakingPool (delegated + wrapped native + native gas token)
 * - Sei: `addresses-sei.json` + `module.exports.sei` (mSEI/mUSDC/mUSDT0 + smSEI/srSEI)
 */

const harmonyConfig = require('./marinus/addresses.json');
const seiConfig = require('./marinus/addresses-sei.json');
const { addMpoolSupplyTvl, addMpoolBorrowedTvl, allMPools } = require('./marinus/mpool');
const { addStakingPoolTvl, allStakingPools } = require('./marinus/staking');

const METHODOLOGY = [
  'Harmony: TVL counts total assets supplied to Marinus MPools (mWONE, mUSDC, mUSDT),',
  'using active mToken supply times a supply-only exchange rate (non-borrow backing plus liquidation surplus to suppliers),',
  'excluding mTokens sent to the burn address; empty pools use totalLiquidity().',
  'Staking TVL adds ONE-equivalent backing in ValidatorStakingPool (smONE) and StablecoinRewardStakingPool (srONE):',
  'totalDelegated plus liquid WONE and native ONE.',
  'Sei: same MPool supply methodology for mSEI, mUSDC, and mUSDT0; staking adds SEI-equivalent backing in smSEI VSP and srSEI SRP',
  '(totalDelegated plus liquid WSEI and native SEI).',
  'Only current canonical pool addresses are included.',
  'Borrowed amounts are reported separately via the borrowed export, not in headline TVL.',
].join(' ');

async function tvlHarmony(api) {
  await addMpoolSupplyTvl(api, harmonyConfig, allMPools(harmonyConfig));
  await addStakingPoolTvl(api, harmonyConfig, allStakingPools(harmonyConfig));
}

async function borrowedHarmony(api) {
  await addMpoolBorrowedTvl(api, harmonyConfig, allMPools(harmonyConfig));
}

async function tvlSei(api) {
  await addMpoolSupplyTvl(api, seiConfig, allMPools(seiConfig));
  await addStakingPoolTvl(api, seiConfig, allStakingPools(seiConfig));
}

async function borrowedSei(api) {
  await addMpoolBorrowedTvl(api, seiConfig, allMPools(seiConfig));
}

module.exports = {
  methodology: METHODOLOGY,
  harmony: {
    tvl: tvlHarmony,
    borrowed: borrowedHarmony,
  },
  sei: {
    tvl: tvlSei,
    borrowed: borrowedSei,
  },
};
