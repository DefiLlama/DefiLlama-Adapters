const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const stableabi = require("./stableABI.json");
const { staking } = require("../helper/staking");
const { transformFantomAddress } = require("../helper/portedTokens");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
// node test.js projects/summitdefi/index.js
const CartographerContract = "0x46d303b6829aDc7AC3217D92f71B1DbbE77eBBA2";
const CartOasisContract = "0x68889c9d8e923b3e310B60ee588242A407fa6755";
const CartElevationContract = "0xdE1e14e2ED8B2D883B8338b514dDc173e792271a";
const triPoolAddress = '0xD163415BD34EF06f57C58D2AEd5A5478AfB464cC';
const WFTM = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83";

const ignoreAddresses = [
  "0x92D5ebF3593a92888C25C0AbEF126583d4b5312E",
  "0x0000000000000000000000000000000000000000",
];

const calcTvl = async (balances, poolInfo, cartographerTypeContract) => {
  let chainBlocks = {};
  const countOfPools = Number(
    (
      await sdk.api.abi.call({
        abi: abi.poolsCount,
        target: CartographerContract,
        chain: "fantom",
        block: chainBlocks["fantom"],
      })
    ).output
  );

  const allPoolNums = Array.from(Array(countOfPools).keys());

  const lpToken = (
    await sdk.api.abi.multiCall({
      abi: poolInfo,
      calls: allPoolNums.map((pid) => ({
        target: cartographerTypeContract,
        params: pid,
      })),
      chain: "fantom",
      block: chainBlocks["fantom"],
    })
  ).output.map((lp) => lp.output.token);

  const lpTokenBalance = (
    await sdk.api.abi.multiCall({
      abi: poolInfo,
      calls: allPoolNums.map((pid) => ({
        target: cartographerTypeContract,
        params: pid,
      })),
      chain: "fantom",
      block: chainBlocks["fantom"],
    })
  ).output.map((bal) => bal.output.supply);

  const symbol = (
    await sdk.api.abi.multiCall({
      abi: abi.symbol,
      calls: lpToken.map((lp) => ({
        target: lp,
      })),
      chain: "fantom",
      block: chainBlocks["fantom"],
    })
  ).output;

  let lpPositions = [];

  lpToken.forEach((lp, pid) => {
    if (
      ignoreAddresses.some((addr) => addr.toLowerCase() === lp.toLowerCase())
    ) {
      return;
    } else if (symbol[pid].output.includes("LP")) {
      lpPositions.push({
        token: lpToken[pid],
        balance: lpTokenBalance[pid],
      });
    } else {
      sdk.util.sumSingleBalance(
        balances,
        `fantom:${lpToken[pid]}`,
        lpTokenBalance[pid]
      );
    }
  });

  const transformAddress = await transformFantomAddress();
  lpPositions = lpPositions.filter(
    a => a.token != triPoolAddress);

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["fantom"],
    "fantom",
    transformAddress,
  );

  const rate = (await sdk.api.abi.call({
    abi: stableabi,
    chain: "fantom",
    block: chainBlocks["fantom"],
    target: triPoolAddress
  })).output;

  const balance = (await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    chain: "fantom",
    block: chainBlocks["fantom"],
    target: triPoolAddress,
    params: CartographerContract
  })).output;

  sdk.util.sumSingleBalance(balances, `usd-coin`, balance * rate / 10 ** 36);

  return balances;
};

const ftmTvl = async () => {
  const balances = {};

  await calcTvl(balances, abi.oasisPoolInfo, CartOasisContract);

  await calcTvl(balances, abi.elevationPoolInfo, CartElevationContract);

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  staking: {
    tvl: staking(CartographerContract, WFTM, "fantom"),
  },
  fantom: {
    tvl: ftmTvl,
  },
  tvl: sdk.util.sumChainTvls([ftmTvl]),
  methodology:
    "We count liquidity on the all Farm Cartographer Types through their Cartographer Contracts",
};
