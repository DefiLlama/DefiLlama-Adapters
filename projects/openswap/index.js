const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const erc20 = require("../helper/abis/erc20.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformHarmonyAddress } = require("../helper/portedTokens");

/* We can't use addFundsInMasterChef function in this case, because we have a different internal structure! */

const MasterChefContract = "0xac71b617a58b3cc136d1f6a118252f331fab44fc";
const ignoreAddresses = ["0xfaADF659160f8c736f6D502Ac4fa8671b65312f0"];

const harmonyTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const poolLength = Number(
    (
      await sdk.api.abi.call({
        abi: abi.poolLength,
        target: MasterChefContract,
        chain: "harmony",
        block: chainBlocks["harmony"],
      })
    ).output
  );

  const allPoolNums = Array.from(Array(poolLength).keys());

  const lpsOrTokens = (
    await sdk.api.abi.multiCall({
      abi: abi.poolInfo,
      calls: allPoolNums.map((idx) => ({
        target: MasterChefContract,
        params: idx,
      })),
      chain: "harmony",
      block: chainBlocks["harmony"],
    })
  ).output.map((lp) => lp.output.lpToken);

  const balance = (
    await sdk.api.abi.multiCall({
      abi: erc20.balanceOf,
      calls: lpsOrTokens.map((lp) => ({
        target: lp,
        params: MasterChefContract,
      })),
      chain: "harmony",
      block: chainBlocks["harmony"],
    })
  ).output.map((bal) => bal.output);

  const symbol = (
    await sdk.api.abi.multiCall({
      abi: abi.symbol,
      calls: lpsOrTokens.map((lp) => ({
        target: lp,
      })),
      chain: "harmony",
      block: chainBlocks["harmony"],
    })
  ).output;

  const lpPositions = [];

  symbol.forEach((symbol, idx) => {
    const token = symbol.input.target;
    if (
      ignoreAddresses.some((addr) => addr.toLowerCase() === token.toLowerCase())
    ) {
      return;
    } else if (symbol.output.includes("/") || symbol.output.includes("LP")) {
      lpPositions.push({
        token: lpsOrTokens[idx],
        balance: balance[idx],
      });
    } else {
      sdk.util.sumSingleBalance(
        balances,
        `harmony:${lpsOrTokens[idx]}`,
        balance[idx]
      );
    }
  });

  let transformAddress = await transformHarmonyAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["harmony"],
    "harmony",
    transformAddress
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  harmony: {
    tvl: harmonyTvl,
  },
  tvl: sdk.util.sumChainTvls([harmonyTvl]),
  methodology:
    "We count liquidity on the Farm seccion through MasterChef Contract",
};
