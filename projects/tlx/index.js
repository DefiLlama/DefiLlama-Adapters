module.exports = {
  start: '2024-04-10',
  deadFrom: '2025-08-12',
  methodology: "Total TLX locked in the genesis locker contract and total TLX staked in the staking contract. TVL is computed as the total margin deposited across the protocol's leveraged tokens.",
  optimism: {
    tvl:  () => ({}),
    staking:  () => ({}),
  },
};
