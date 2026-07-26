/**
 * Marinus Protocol — Harmony Finance TVL adapter for DefiLlama-Adapters.
 *
 * NOT connected to DeFiLlama from this repo. Copy this folder into
 * https://github.com/DefiLlama/DefiLlama-Adapters/tree/main/projects/marinus
 * and open a PR when ready to list. Rename *.cjs → *.js in that repo (CJS).
 *
 * TVL methodology matches the Marinus frontend:
 * - Lending: mPool total supplied (active mToken supply × exchange rate, minus burn address)
 * - Staking: ValidatorStakingPool + StablecoinRewardStakingPool (delegated + WONE + native ONE)
 */

const config = require('./marinus/addresses.json');
const { addMpoolSupplyTvl, addMpoolBorrowedTvl, allMPools } = require('./marinus/mpool');
const { addStakingPoolTvl, allStakingPools } = require('./marinus/staking');

const METHODOLOGY = [
  'TVL counts total assets supplied to Marinus Harmony MPools (mWONE, mUSDC, mUSDT),',
  'using the same formula as the Marinus app: active mToken supply times exchangeRateStored,',
  'excluding mTokens sent to the burn address; empty pools use totalLiquidity().',
  'Staking TVL adds ONE-equivalent backing in ValidatorStakingPool (smONE) and',
  'StablecoinRewardStakingPoolUUPS (srONE): totalDelegated plus liquid WONE and native ONE.',
  'Only current canonical pool addresses are included.',
  'Borrowed amounts are reported separately via the borrowed export, not in headline TVL.',
].join(' ');

async function tvl(api) {
  await addMpoolSupplyTvl(api, config, allMPools(config));
  await addStakingPoolTvl(api, config, allStakingPools(config));
}

async function borrowed(api) {
  await addMpoolBorrowedTvl(api, config, allMPools(config));
}

module.exports = {
  methodology: METHODOLOGY,
  harmony: {
    tvl,
    borrowed,
  },
};
