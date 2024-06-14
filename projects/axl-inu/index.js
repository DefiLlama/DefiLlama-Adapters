const { stakings } = require("../helper/staking");

const stakingContractsBSC = ["0xd500a6652365E819888Aa4df72d79eE970dB9B42"]
const stakingContractsETH = ["0x440D1c47379CF17CCB7Eb334Ae80DC8291FB14Ad"]

const AXL = "0x25b24B3c47918b7962B3e49C4F468367F73CC0E0";

module.exports = {
      methodology: 'TVL only counts liquidity in the staking pools.',
  bsc: {
    staking: stakings(stakingContractsBSC, AXL),
    tvl: (async) => ({}),
  },
  ethereum: {
    staking: stakings(stakingContractsETH, AXL),
    tvl: (async) => ({}),
  },
};
