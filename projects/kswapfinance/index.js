const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const erc20 = require("../helper/abis/erc20.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformOkexAddress } = require("../helper/portedTokens");

const liquidityPoolContract = "0xaEBa5C691aF30b7108D9C277d6BB47347387Dc13";
const depositPoolContract = "0x5E6D7c01824C64C4BC7f2FF42C300871ce6Ff555";

const calcTvl = async (balances, chain, block, pool) => {
  const poolLength = (
    await sdk.api.abi.call({
      abi: abi.getPoolLength,
      target: pool,
      chain,
      block,
    })
  ).output;

  const lpPositions = [];

  for (let index = 0; index < poolLength; index++) {
    const lpOrTokens = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: pool,
        params: index,
        chain,
        block,
      })
    ).output[0];

    const lpOrToken_bal = (
      await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: lpOrTokens,
        params: pool,
        chain,
        block,
      })
    ).output;
    if (pool == liquidityPoolContract) {
      lpPositions.push({
        token: lpOrTokens,
        balance: lpOrToken_bal,
      });
    } else {
      sdk.util.sumSingleBalance(
        balances,
        `okexchain:${lpOrTokens}`,
        lpOrToken_bal
      );
    }
  }
  const transformAddress = await transformOkexAddress();

  await unwrapUniswapLPs(balances, lpPositions, block, chain, transformAddress);
};

const okexTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  await calcTvl(balances, "okexchain", chainBlocks["okexchain"], liquidityPoolContract);

  await calcTvl(balances, "okexchain", chainBlocks["okexchain"], depositPoolContract);

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  tvl: sdk.util.sumChainTvls([okexTvl]),
  methodology:
    "We count tvl on the mining pool threw LiquidityPool(pairs) contract and farming pool threw DepsitPool(single tokens) contract",
};
