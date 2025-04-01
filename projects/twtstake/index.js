const { staking } = require("../helper/staking");
const TWT_STAKE_CONTRACT = '0x5e7c3c55eb5c0ee10817d70e414f4b1ee22d5ce3';
const TWT_TOKEN_CONTRACT = '0x4b0f1812e5df2a09796481ff14017e6005508003';

module.exports = {
  hallmarks: [
    [1681948800, "TWTStake Flagged on Twitter"]
  ],
      methodology: 'Counts the number of TWT tokens in the TWT Stake contract.',
  bsc: {
    tvl: () => 0,
    staking: staking(TWT_STAKE_CONTRACT,TWT_TOKEN_CONTRACT)
  },
  deadFrom: '2023-05-15'
};
