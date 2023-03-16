const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformPolygonAddress } = require("../helper/portedTokens");

const MasterAugur = "0x6ad70613d14c34aa69E1604af91c39e0591a132e";

const polygonTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const poolLength = Number(
    (
      await sdk.api.abi.call({
        abi: abi.poolLength,
        target: MasterAugur,
        chain: "polygon",
        block: chainBlocks["polygon"],
      })
    ).output
  );

  const allPoolNums = Array.from(Array(poolLength).keys());

  const lpTokens = (
    await sdk.api.abi.multiCall({
      abi: abi.poolInfo,
      calls: allPoolNums.map((num) => ({
        target: MasterAugur,
        params: num,
      })),
      chain: "polygon",
      block: chainBlocks["polygon"],
    })
  ).output.map((lp) => lp.output[0]);

  const balance = (
    await sdk.api.abi.multiCall({
      abi: 'erc20:balanceOf',
      calls: lpTokens.map((lp) => ({
        target: lp,
        params: MasterAugur,
      })),
      chain: "polygon",
      block: chainBlocks["polygon"],
    })
  ).output.map((lp) => lp.output);

  const lpPositions = [];

  for (let index = 0; index < allPoolNums.length; index++) {
    if (index == 1 || index == 17 || index == 18) {
      lpPositions.push({
        token: lpTokens[index],
        balance: balance[index],
      });
    } else {
      sdk.util.sumSingleBalance(
        balances,
        `polygon:${lpTokens[index]}`,
        balance[index]
      );
    }
  }

  const transformAddress = await transformPolygonAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["polygon"],
    "polygon",
    transformAddress
  );

  return balances;
};

module.exports = {
  methodology: 'MasterAugur(MasterChef) contract is used to pull LP token amounts. LP tokens are unwrapped and each token token balance is considered in the TVL sum.',
  polygon: {
    tvl: polygonTvl,
  },
};
