const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const erc20 = require("../helper/abis/erc20.json");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const proxyContract = "0x5406e1136F423602C0685DF8802f8ef28b73570d";
const candyFarmsContracts = [
  "0xb9e10599248f9f3fd35ecd1a098f56dab537ebbe",
  "0xd05497c6e24f7013ab67cdc8fa4d5af48e58ebe9",
  "0xebb7ab0b5a219bb395b88dfb1e5ae05ef8fddfa7",
];
const POP = "0x7fc3ec3574d408f3b59cd88709bacb42575ebf2b";

const stakingPOP = async (block) => {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [[POP, false]],
    candyFarmsContracts
  );

  return balances;
};

const ethTvl = async (block) => {
  const balances = {};

  const countMlp = (
    await sdk.api.abi.call({
      abi: abi.pendingMlpCount,
      target: proxyContract,
      block,
    })
  ).output;

  const lpPositions = [];

  for (let i = 0; i < countMlp; i++) {
    const mlp = (
      await sdk.api.abi.call({
        abi: abi.allMlp,
        target: proxyContract,
        params: i,
        block,
      })
    ).output;

    const mlpPairUNI = (
      await sdk.api.abi.call({
        abi: abi.uniswapPair,
        target: mlp,
        block,
      })
    ).output;

    const mlpBalance = (
      await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: mlpPairUNI,
        params: mlp,
        block,
      })
    ).output;

    lpPositions.push({
      token: mlpPairUNI,
      balance: mlpBalance,
    });
  }

  await unwrapUniswapLPs(balances, lpPositions, block);

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: stakingPOP,
    tvl: ethTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl]),
  methodology:
    "We count liquidity on the Marketplace and CandyFarms through Proxy and CandyFarm Contracts",
};
