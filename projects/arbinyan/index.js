const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const BigNumber = require("bignumber.js");

const stakingETHContract = "0x9F7968de728aC7A6769141F63dCA03FD8b03A76F";
const WETH = ADDRESSES.ethereum.WETH;

const stakingNYANContract = "0x32e5594F14de658b0d577D6560fA0d9C6F1aa724";
const NYAN = "0xed3fb761414da74b74f33e5c5a1f78104b188dfc";

const stakingPool2Contract = "0x62FF5Be795262999fc1EbaC29277575031d2dA2C";
const NYAN_WETH_SLP = "0x70Df9Dd83be2a9F9Fcc58Dd7C00d032d007b7859";
const WETH_arb = ADDRESSES.arbitrum.WETH;

async function pool2(time, ethBlock, chainBlocks) {
  const balances = {};

  const balance_slp = (
    await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      target: NYAN_WETH_SLP,
      params: stakingPool2Contract,
      chain: "arbitrum",
      block: chainBlocks["arbitrum"],
    })
  ).output;

  const totalSupply_slp = (
    await sdk.api.erc20.totalSupply({
      target: NYAN_WETH_SLP,
      chain: "arbitrum",
      block: chainBlocks["arbitrum"],
    })
  ).output;

  const underlyingsBalance = (
    await sdk.api.abi.multiCall({
      calls: [NYAN, WETH_arb].map((token) => ({
        target: token,
        params: NYAN_WETH_SLP,
      })),
      abi: 'erc20:balanceOf',
      chain: "arbitrum",
      block: chainBlocks["arbitrum"],
    })
  ).output;

  underlyingsBalance.forEach((call) => {
    const underlyingSetBalance = BigNumber(call.output)
      .times(balance_slp)
      .div(totalSupply_slp);

    sdk.util.sumSingleBalance(
      balances,
      `arbitrum:${call.input.target}`,
      underlyingSetBalance.toFixed(0)
    );
  });

  return balances;
}

async function arbTvl(time, _ethBlock, {arbitrum: block}) {
  const eth = await sdk.api.eth.getBalance({
    target: stakingETHContract,
    block,
    chain: "arbitrum",
  });
  return {
    [WETH]: eth.output,
  };
}

module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    staking: staking(stakingNYANContract, NYAN),
    pool2: pool2,
    tvl: arbTvl,
  },
  methodology:
    "Counts as TVL the ETH asset deposited through StakingETH Contract, and we count Staking and Pool2 parts in the same way",
};
