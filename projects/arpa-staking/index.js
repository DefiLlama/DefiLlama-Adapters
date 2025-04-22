const STAKING_CONTRACT = "0xee710f79aa85099e200be4d40cdf1bfb2b467a01";
const ARPA = "0xBA50933C268F567BDC86E1aC131BE072C6B0b71a";

const staking = async (api) => {
  const val = await api.call({ target: STAKING_CONTRACT, abi: 'uint256:getTotalCommunityStakedAmount', });
  api.add(ARPA, val)
  return api.getBalances()
};

module.exports = {
  methodology: "TVL is the total amount of ARPA staked by the community",
  ethereum: {
    tvl: () => ({}),
    staking,
  },
};
