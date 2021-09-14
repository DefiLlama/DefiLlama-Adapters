const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");

const FeatureStaking = "0xc0ffee0000212c25e338100f46c962473ed0447a";
const KOFFEE = "0xc0ffee0000921eb8dd7d506d4de8d5b79b856157";

const brewContracts = [
  //KCS-USDT
  "0xc0Ffee000019988Ae7e8aaA41AF3886eB8750401",
  //KCS-USDC
  "0xc0FfeE000016Ed5788F82814bE35AE8c8Aba06Cc",
  //KCS-KOFFEE
  "0xC0FFeE0000123A0DfdE79aaAA124B4919393cd0F",
  //KOFFEE-USDT
  "0xC0FfeE0000c3C9087Bc012d00F13ad5c781cEe87",
  //KOFFEE-USDC
  "0xc0fFEe0000961b3e66C635e3395EAbc6A637c8A2",
];

/*** Staking of native token (KOFFEE) TVL Portion ***/
const staking = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const stakingBalance = (
    await sdk.api.abi.call({
      abi: erc20.balanceOf,
      target: KOFFEE,
      params: FeatureStaking,
      chain: "kucoin",
      block: chainBlocks["kucoin"],
    })
  ).output;

  sdk.util.sumSingleBalance(balances, `kucoin:${KOFFEE}`, stakingBalance);

  return balances;
};

const kccTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const stakingTokens = (
    await sdk.api.abi.multiCall({
      abi: abi.stakingToken,
      calls: brewContracts.map((brew) => ({
        target: brew,
      })),
      chain: "kcc",
      block: chainBlocks["kcc"],
    })
  ).output.map((st) => st.output);

  for (let i = 0; i < stakingTokens.length; i++) {
    const token0 = (
      await sdk.api.abi.call({
        target: stakingTokens[i],
        abi: abi.token0,
        chain: "kcc",
        block: chainBlocks["kcc"],
      })
    ).output;

    const token1 = (
      await sdk.api.abi.call({
        target: stakingTokens[i],
        abi: abi.token1,
        chain: "kcc",
        block: chainBlocks["kcc"],
      })
    ).output;

    const getReserves = (
      await sdk.api.abi.call({
        target: stakingTokens[i],
        abi: abi.getReserves,
        chain: "kcc",
        block: chainBlocks["kcc"],
      })
    ).output;

    sdk.util.sumSingleBalance(balances, `kcc:${token0}`, getReserves[0]);

    sdk.util.sumSingleBalance(balances, `kcc:${token1}`, getReserves[1]);
  }

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  staking: {
    tvl: staking,
  },
  kcc: {
    tvl: kccTvl,
  },
  tvl: sdk.util.sumChainTvls([kccTvl]),
  methodology:
    "We count liquidity on the brews threw their contracts and the portion TVL staking the native token (KOFFEE) by FeatureStaking contract",
};
