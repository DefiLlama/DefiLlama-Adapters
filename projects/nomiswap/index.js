const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require("../helper/unknownTokens");
const { stakings } = require("../helper/staking");
const sdk = require('@defillama/sdk')

const constantProductFactory = "0xd6715A8be3944ec72738F0BFDC739d48C3c29349";
const stableSwapFactory = "0xC6B7ee49D386bAe4FD501F2d2f8d18828F1f6285";
const factories = [constantProductFactory, stableSwapFactory].map(factory => getUniTVL({
  factory,
  useDefaultCoreAssets: true
}))

const NMX = ADDRESSES.bsc.NMX

const stakingPools = [
  // Staking pool
  "0xdbf1b10fe3e05397cd454163f6f1ed0c1181c3b3",
]

module.exports = {
  bsc: {
    staking: stakings(stakingPools, NMX),
    tvl: sdk.util.sumChainTvls(factories),
  },
};