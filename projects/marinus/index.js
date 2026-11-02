/**
 * Marinus Protocol — DefiLlama TVL adapter.
 *
 * - Sei (primary): `addresses-sei.json` (mSEI/mUSDC/mUSDT0 MPools + smSEI/srSEI staking)
 * - BNB Finance (bsc): `addresses-bnb.json` (reports zero until BSC MPools deploy)
 * - Harmony (historic): markets retired 2026-10-20 when Marinus moved to Sei.
 *   Export returns empty so past Harmony TVL stays in history without new datapoints.
 */

const seiConfig = require('./marinus/addresses-sei.json');
const bnbConfig = require('./marinus/addresses-bnb.json');
const { addMpoolSupplyTvl, addMpoolBorrowedTvl, allMPools } = require('./marinus/mpool');
const { addStakingPoolTvl, allStakingPools } = require('./marinus/staking');

const METHODOLOGY = [
  'Sei: TVL counts total assets supplied to Marinus MPools (mSEI, mUSDC, mUSDT0),',
  'using active mToken supply times a supply-only exchange rate (non-borrow backing plus liquidation surplus to suppliers),',
  'excluding mTokens sent to the burn address; empty pools use totalLiquidity().',
  'Staking TVL adds SEI-equivalent backing in the smSEI ValidatorStakingPool and srSEI StablecoinRewardStakingPool',
  '(totalDelegated plus liquid WSEI and native SEI).',
  'BNB Chain (bsc): same methodology once BNB Finance MPools are listed in addresses-bnb.json; until then it reports zero.',
  'Harmony: historic only. Marinus Harmony markets were retired on 2026-10-20 and no longer report TVL.',
  'Only current canonical pool addresses are included.',
  'Borrowed amounts are reported separately via the borrowed export, not in headline TVL.',
].join(' ');

async function tvlSei(api) {
  await addMpoolSupplyTvl(api, seiConfig, allMPools(seiConfig));
  await addStakingPoolTvl(api, seiConfig, allStakingPools(seiConfig));
}

async function borrowedSei(api) {
  await addMpoolBorrowedTvl(api, seiConfig, allMPools(seiConfig));
}

async function tvlBsc(api) {
  if (bnbConfig.live === false) return;
  await addMpoolSupplyTvl(api, bnbConfig, allMPools(bnbConfig));
  await addStakingPoolTvl(api, bnbConfig, allStakingPools(bnbConfig));
}

async function borrowedBsc(api) {
  if (bnbConfig.live === false) return;
  await addMpoolBorrowedTvl(api, bnbConfig, allMPools(bnbConfig));
}

module.exports = {
  methodology: METHODOLOGY,
  hallmarks: [
    ['2026-10-20', 'Marinus moves to Sei; Harmony markets retired'],
  ],
  sei: {
    tvl: tvlSei,
    borrowed: borrowedSei,
  },
  bsc: {
    tvl: tvlBsc,
    borrowed: borrowedBsc,
  },
  harmony: {
    tvl: () => ({}),
    borrowed: () => ({}),
  },
};
