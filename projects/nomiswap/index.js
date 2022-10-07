const BigNumber = require("bignumber.js");
const { getUniTVL } = require("../helper/unknownTokens");
const { stakings } = require("../helper/staking");

const constantProductFactory = "0xd6715A8be3944ec72738F0BFDC739d48C3c29349";
const stableSwapFactory = "0xC6B7ee49D386bAe4FD501F2d2f8d18828F1f6285";
const factories = [constantProductFactory, stableSwapFactory];

const NMX = "0xd32d01a43c869edcd1117c640fbdcfcfd97d9d65"

const stakingPools = [
  // Staking pool
  "0xdbf1b10fe3e05397cd454163f6f1ed0c1181c3b3",
]

async function getAllTvls(ts, _block, chainBlocks) {
  const tvlPromises = factories
    .map(factory => {
      return {
        factory,
        chain: 'bsc',
        useDefaultCoreAssets: true
      };
    })
    .map(params => getUniTVL(params))
    .map(f => f(this, ts, _block, chainBlocks));
  const tvls = await Promise.all(tvlPromises);
  const result = tvls
    .reduce((a, b) => {
      const r = { ...a }
      for (let key in b) {
        const aVal = new BigNumber(a[key] || '0');
        const bVal = new BigNumber(b[key] || '0');
        r[key] = aVal.plus(bVal);
      }
      return r;
    });
  return result;
}

module.exports = {
  bsc: {
    staking: stakings(stakingPools, NMX, 'bsc'),
    tvl: getAllTvls,
  },
};