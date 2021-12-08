const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformFantomAddress } = require("../helper/portedTokens");

const masterChefContract = "0x4fff737de45da4886f711b2d683fb6A6cf62C60C";
const USDC = "0x04068da6c83afcfa0e13ba15a6696662335d5b75";

const ftmTvl = async (chainBlocks) => {
  const balances = {};

  const poolLength = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: masterChefContract,
      chain: "fantom",
      block: chainBlocks["fantom"],
    })
  ).output;

  const lpPositions = [];

  for (let index = 0; index < poolLength; index++) {
    const strat = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: masterChefContract,
        params: index,
        chain: "fantom",
        block: chainBlocks["fantom"],
      })
    ).output.strat;

    const want = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: masterChefContract,
        params: index,
        chain: "fantom",
        block: chainBlocks["fantom"],
      })
    ).output.want;

    const strat_bal = (
      await sdk.api.abi.call({
        abi: abi.wantLockedTotal,
        target: strat,
        chain: "fantom",
        block: chainBlocks["fantom"],
      })
    ).output;

    const symbol = (
      await sdk.api.abi.call({
        abi: abi.symbol,
        target: want,
        chain: "fantom",
        block: chainBlocks["fantom"],
      })
    ).output;

    if (symbol.includes("LP")) {
      lpPositions.push({
        token: want,
        balance: strat_bal,
      });
    } else if (symbol.includes("DAI+USDC")) {
      sdk.util.sumSingleBalance(balances, `fantom:${USDC}`, strat_bal/10**12);
    } else {
      sdk.util.sumSingleBalance(balances, `fantom:${want}`, strat_bal);
    }
  }

  const transformAddress = await transformFantomAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["fantom"],
    "fantom",
    transformAddress
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  fantom: {
    tvl: ftmTvl,
  },
  tvl: sdk.util.sumChainTvls([ftmTvl]),
  methodology:
    "We count liquidity on all the Vaults through MasterChef Contract",
};
