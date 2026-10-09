const FARM = '0xceA42138b022014BdeA7C4EFc1CAF9A9e719b6D0';
const LP = '0xBD92961CA33E137270Bf5Bcd902ed1BAEf9A38e0';

async function tvl(api) {
  const lpBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: LP,
    params: [FARM],
  });
  api.add(LP, lpBalance);
}

module.exports = {
  methodology: 'counts the LP tokens of the KAMIRAI WBNB pair staked in the Kyorai farm on BNB Smart Chain.',
  bsc: {
    tvl,
  },
};
