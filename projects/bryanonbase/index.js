const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const BigNumber = require("bignumber.js");

const stakingETHContract = "0x9acDDdbEBED00107B3eF2931607F131F392f6996";
const WETH = ADDRESSES.ethereum.WETH;

const stakingBRYANContract = "0x32e5594F14de658b0d577D6560fA0d9C6F1aa724";
const BRYAN = "0xB75445A717D5A8c268f37045162837CFe72Ac337";

const stakingPool2Contract = "0x5DFF152F94E0EADeD36201f1D5AC37382f3Cf51D";
const BRYAN_WETH_SLP = "0xbCA1647EA6C7eB6916a5B33E21467ff78Bf5Ec55";
const WETH_base = ADDRESSES.base.WETH;

const stakeBryanEarnWeth = "0xC0c8BCAf6c1baE2d4A35f4D89A8EAc9A9E5D4Db0"
const stakeLpEarnWeth = "0xCf4543777342D93BEde085292E46D847BC59dc07"

async function pool2(time, ethBlock, chainBlocks) {
  const balances = {};

  const balance_slp = (
    await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      target: BRYAN_WETH_SLP,
      params: stakingPool2Contract,
      chain: "base",
      block: chainBlocks["base"],
    })
  ).output;


  const totalSupply_slp = (
    await sdk.api.erc20.totalSupply({
      target: BRYAN_WETH_SLP,
      chain: "base",
      block: chainBlocks["base"],
    })
  ).output;

  const underlyingsBalance = (
    await sdk.api.abi.multiCall({
      calls: [BRYAN, WETH_base].map((token) => ({
        target: token,
        params: BRYAN_WETH_SLP,
      })),
      abi: 'erc20:balanceOf',
      chain: "base",
      block: chainBlocks["base"],
    })
  ).output;

  underlyingsBalance.forEach((call) => {
    const underlyingSetBalance = BigNumber(call.output)
      .times(balance_slp)
      .div(totalSupply_slp);

    sdk.util.sumSingleBalance(
      balances,
      `base:${call.input.target}`,
      underlyingSetBalance.toFixed(0)
    );
  });

  return balances;
}

async function pool2EarnWeth(time, ethBlock, chainBlocks) {
  const balances = {};

  const balance_slp = (
    await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      target: BRYAN_WETH_SLP,
      params: stakeLpEarnWeth,
      chain: "base",
      block: chainBlocks["base"],
    })
  ).output;


  const totalSupply_slp = (
    await sdk.api.erc20.totalSupply({
      target: BRYAN_WETH_SLP,
      chain: "base",
      block: chainBlocks["base"],
    })
  ).output;

  const underlyingsBalance = (
    await sdk.api.abi.multiCall({
      calls: [BRYAN, WETH_base].map((token) => ({
        target: token,
        params: BRYAN_WETH_SLP,
      })),
      abi: 'erc20:balanceOf',
      chain: "base",
      block: chainBlocks["base"],
    })
  ).output;

  underlyingsBalance.forEach((call) => {
    const underlyingSetBalance = BigNumber(call.output)
      .times(balance_slp)
      .div(totalSupply_slp);

    sdk.util.sumSingleBalance(
      balances,
      `base:${call.input.target}`,
      underlyingSetBalance.toFixed(0)
    );
  });

  return balances;
}

async function arbTvl(time, ethBlock, chainBlocks) {

  const eth = (
    await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      target: WETH_base,
      params: stakingETHContract,
      chain: "base",
      block: chainBlocks["base"],
    })
  ).output;

  const ethRewardsLP = (
    await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      target: WETH_base,
      params: stakeLpEarnWeth,
      chain: "base",
      block: chainBlocks["base"],
    })
  ).output;

  const ethRewards = (
    await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      target: WETH_base,
      params: stakeBryanEarnWeth,
      chain: "base",
      block: chainBlocks["base"],
    })
  ).output;

  console.log(eth)
  console.log(ethRewards)
  console.log(ethRewardsLP)

  const outputTotal = Number(eth) + Number(ethRewards) + Number(ethRewardsLP);

  console.log(outputTotal)

  return {
    [WETH]: outputTotal.toString(),
  };
}

module.exports = {
  misrepresentedTokens: true,
  base: {
    staking: staking(stakingBRYANContract, BRYAN, "base"),
    staking: staking(stakeBryanEarnWeth, BRYAN, "base"),
    pool2: pool2,
    pool2: pool2EarnWeth,
    tvl: arbTvl,
  },
  methodology:
    "Counts as TVL the ETH asset deposited through StakingETH Contract, and we count Staking and Pool2 parts in the same way",
};
