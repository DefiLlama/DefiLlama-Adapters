const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport, sumTokens2 } = require('../helper/unwrapLPs');
const { staking } = require("../helper/staking");

// Token addresses
const AIXCB_TOKEN = "0x76C71F1703Fbf19FFdcF3051E1e684Cb9934510f";
const WETH = ADDRESSES.base.WETH;

// LP and staking addresses
const AERODROME_LP_TOKEN = "0x19C3c7EEfb070EE00ddE367A9768De1DF52cbE5d";
const LP_STAKING = "0xEE5C223aD4055beE465244d8Cb344fb22DaDa570";
const AIXCB_STAKING = "0xF5acA5c3a0B70f847dE4652AC77BD601ccFE8339";

async function stakingTvl(api) {
  const totalStaked = await api.call({
    abi: 'function getTotalStaked() external view returns (uint256)',
    target: AIXCB_STAKING,
  });
  api.add(AIXCB_TOKEN, totalStaked);
}

async function pool2Tvl(api) {
  const totalStaked = await api.call({
    abi: 'function totalStakedAmount() external view returns (uint256)',
    target: LP_STAKING,
  });
  api.add(AERODROME_LP_TOKEN, totalStaked);
}

module.exports = {
  methodology: 'TVL consists of aixCB tokens staked in the AIXCBStaking contract (getTotalStaked) and Aerodrome vAMM-aixCB/WETH LP tokens staked in the AIXCBLPStaking contract (totalStakedAmount).',
  base: {
    tvl: () => ({}),
    staking: stakingTvl,
    pool2: pool2Tvl,
  },
  start: 23995964,
}; 