const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformFantomAddress } = require("../helper/portedTokens");

const NATIVE_CONTRACT = "0xe5AFC91CEA5df74748A2b07e1d48E4e01aacF52B";

const fantomTvl = async (timestamp, block, chainBlocks) => {
  const balances = {};

  const poolLenth = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: NATIVE_CONTRACT,
      chain: "fantom",
      block: chainBlocks["fantom"],
    })
  ).output;

  const lpPositions = [];

  for (let index = 0; index < poolLenth; index++) {
    const poolInfo = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: NATIVE_CONTRACT,
        params: index,
        chain: "fantom",
        block: chainBlocks["fantom"],
      })
    ).output;

    const wantBalance = (
      await sdk.api.abi.call({
        abi: abi.wantLockedTotal,
        target: poolInfo[4],
        chain: "fantom",
        block: chainBlocks["fantom"],
      })
    ).output;

    try {
      const symbol = (
        await sdk.api.abi.call({
          abi: abi.symbol,
          target: poolInfo[0],
          chain: "fantom",
          block: chainBlocks["fantom"],
        })
      ).output;

      if (symbol == "fWINGS-LP" || symbol == "spLP" || symbol == "SPIRIT-LP" || symbol == "dKnight-LP") {
        lpPositions.push({
          token: poolInfo[0],
          balance: wantBalance,
        });
      } else {
        sdk.util.sumSingleBalance(balances, `fantom:${poolInfo[0]}`, wantBalance);
      }
    } catch (err) {
      console.error(err);
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
  fantom: {
    tvl: fantomTvl,
  },
  tvl: sdk.util.sumChainTvls([fantomTvl]),
};
