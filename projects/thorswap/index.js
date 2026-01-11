const THOR = "0xa5f2211b9b8170f694421f2046281775e8468044";
const VTHOR = "0x815C23eCA83261b6Ec689b60Cc4a58b54BC24D8D";
const UTHOR = "0x34deff97889f3a6a483e3b9255cafcb9a6e03588";
const YTHOR = "0x8793CD69895C45b2d2474236b3Cb28FC5C764775";

const staking = async (api) => {
  const stakingContracts = [VTHOR, UTHOR, YTHOR];
  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: stakingContracts.map(contract => ({ target: THOR, params: [contract] }))
  });

  balances.forEach(balance => api.add(THOR, balance));
  return api.getBalances();
};

module.exports = {
  methodology: "TVL is the total amount of THOR tokens staked in VTHOR, UTHOR, and YTHOR staking contracts",
  ethereum: {
    tvl: () => ({}),
    staking,
  },
};
