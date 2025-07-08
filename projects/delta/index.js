const { staking } = require("../helper/staking");

const vaultStakingContract = "0x9fE9Bb6B66958f2271C4B0aD23F6E8DDA8C221BE";
const rebasingContract = "0xfcfC434ee5BfF924222e084a8876Eee74Ea7cfbA";
const DELTA_WETH_SLP = "0x1498bd576454159Bb81B5Ce532692a8752D163e8";

const DELTA = "0x9EA3b5b4EC044b70375236A281986106457b20EF";

async function pool2(api) {
  const totalSupply_rlp = await api.call({ abi: 'erc20:totalSupply', target: rebasingContract, })
  const balance_slp = await api.call({ abi: 'erc20:balanceOf', target: DELTA_WETH_SLP, params: rebasingContract, })
  const balance_rlp = await api.call({ abi: 'erc20:balanceOf', target: rebasingContract, params: vaultStakingContract, })
  api.add(DELTA_WETH_SLP, balance_slp * balance_rlp / totalSupply_rlp)
}

module.exports = {
  ethereum: {
    staking: staking(vaultStakingContract, DELTA),
    pool2,
    tvl: async () => ({})
  },
  methodology: "Counts liquidty on the Staking and Pool2",
};
