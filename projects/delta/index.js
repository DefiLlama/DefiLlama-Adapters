const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const { staking } = require("../helper/staking");

const vaultStakingContract = "0x9fE9Bb6B66958f2271C4B0aD23F6E8DDA8C221BE";
const rebasingContract = "0xfcfC434ee5BfF924222e084a8876Eee74Ea7cfbA";
const DELTA_WETH_SLP = "0x1498bd576454159Bb81B5Ce532692a8752D163e8";

const DELTA = "0x9EA3b5b4EC044b70375236A281986106457b20EF";
const WETH = ADDRESSES.ethereum.WETH;

async function Pool2(timestamp, block) {
  const balances = {};

  const totalSupply_slp = (
    await sdk.api.erc20.totalSupply({
      target: DELTA_WETH_SLP,
    })
  ).output;

  const totalSupply_rlp = (
    await sdk.api.erc20.totalSupply({
      target: rebasingContract,
    })
  ).output;

  const balance_slp = (
    await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      target: DELTA_WETH_SLP,
      params: rebasingContract,
      block
    })
  ).output;

  const balance_rlp = (
    await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      target: rebasingContract,
      params: vaultStakingContract,
      block
    })
  ).output;

  const underlyingsBalance = (
    await sdk.api.abi.multiCall({
      calls: [DELTA, WETH].map((token) => ({
        target: token,
        params: DELTA_WETH_SLP,
      })),
      abi: 'erc20:balanceOf',
      block
    })
  ).output;

  underlyingsBalance.forEach((call) => {
    const underlyingSetBalance = BigNumber(call.output)
      .times(balance_slp)
      .div(totalSupply_slp)
      .times(balance_rlp)
      .div(totalSupply_rlp);

    sdk.util.sumSingleBalance(
      balances,
      call.input.target,
      underlyingSetBalance.toFixed(0)
    );
  });

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: staking(vaultStakingContract, DELTA),
    pool2: Pool2,
    tvl: async () => ({})
  },
  methodology: "Counts liquidty on the Staking and Pool2",
};
