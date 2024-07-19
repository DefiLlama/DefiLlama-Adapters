const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const BigNumber = require("bignumber.js");

const stakingETHContract = "0x27F0408729dCC6A4672e1062f5003D2a07E4E10D";
const WETH = ADDRESSES.ethereum.WETH;

const stakingCARBONContract = "0x2C5058325373d02Dfd6c08E48d91FcAf8fD49f45";
const CARBON = "0xfa42da1bd08341537a44a4ca9d236d1c00a98b40";

const stakingPool2Contracts = [
  //stakingCARBON_WETHContract
  "0x701e594B58b183b93C1ebaE437fBC9a9A3eC97d7",
  //stakingCARBON_NYANContract
  "0x45acd6Af27B2506ad68C0fEA9F597D6eE6818722",
];
const lpAddresses = [
  //CARBON_WETH_SLP
  "0x08da83452Ae158c3F348d4e0789b7A78989f34eE",
  //CRABON_NYAN_SLP
  "0x89450F6C7d7f2c5971E9Ee28e94d8b199d17f673",
];

const WETH_arb = ADDRESSES.arbitrum.WETH;
const NYAN = "0xed3fb761414da74b74f33e5c5a1f78104b188dfc";

async function pool2(time, ethBlock, chainBlocks) {
  const balances = {};

  for (let idx = 0; idx < lpAddresses.length; idx++) {
    const balances_slp = (
      await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
        target: lpAddresses[idx],
        params: stakingPool2Contracts[idx],
        chain: "arbitrum",
        block: chainBlocks["arbitrum"],
      })
    ).output;

    const totalSupply_slp = (
      await sdk.api.erc20.totalSupply({
        target: lpAddresses[idx],
        chain: "arbitrum",
        block: chainBlocks["arbitrum"],
      })
    ).output;

    const underlyingsBalance = (
      await sdk.api.abi.multiCall({
        calls: [CARBON, NYAN, WETH_arb].map((token) => ({
          target: token,
          params: lpAddresses[idx],
        })),
        abi: 'erc20:balanceOf',
        chain: "arbitrum",
        block: chainBlocks["arbitrum"],
      })
    ).output;

    underlyingsBalance.forEach((call) => {
      const underlyingSetBalance = BigNumber(call.output)
        .times(balances_slp)
        .div(totalSupply_slp);

      sdk.util.sumSingleBalance(
        balances,
        `arbitrum:${call.input.target}`,
        underlyingSetBalance.toFixed(0)
      );
    });
  }

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
    staking: staking(stakingCARBONContract, CARBON),
    pool2: pool2,
    tvl: arbTvl,
  },
  methodology:
    "Counts as TVL the ETH asset deposited through StakingETH Contract, and we count Staking and Pool2 parts in the same way",
};
