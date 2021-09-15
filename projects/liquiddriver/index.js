const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const {staking} = require("../helper/staking");
const BigNumber = require("bignumber.js");

// --- All sushitokens lp tokens are staked here for LQDR tokens ---
const MASTERCHEF = "0x742474dae70fa2ab063ab786b1fbe5704e861a0c";
const MINICHEF = "0x6e2ad6527901c9664f016466b8DA1357a004db0f";

const LQDR = "0x10b620b2dbac4faa7d7ffd71da486f5d44cd86f9";
const xLQDR = "0x3Ae658656d1C526144db371FaEf2Fff7170654eE";

const masterchefTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const transformAddress = await transformFantomAddress();

  await addFundsInMasterChef(
    balances,
    MASTERCHEF,
    chainBlocks.fantom,
    "fantom",
    transformAddress,
    abi.poolInfo
  );

  return balances;
};

const minichefTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const transformAddress = await transformFantomAddress();

  // pool section tvl
  const poolLength = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: MINICHEF,
      chain: "fantom",
      block: chainBlocks["fantom"],
    })
  ).output;

  const [lpTokens, strategies] = await Promise.all([
    sdk.api.abi.multiCall({
      block: chainBlocks["fantom"],
      calls: Array.from(Array(Number(poolLength)).keys()).map((i) => ({
        target: MINICHEF,
        params: i,
      })),
      abi: abi.lpToken,
      chain: "fantom",
    }),
    sdk.api.abi.multiCall({
      block: chainBlocks["fantom"],
      calls: Array.from(Array(Number(poolLength)).keys()).map((i) => ({
        target: MINICHEF,
        params: i,
      })),
      abi: abi.strategies,
      chain: "fantom",
    }),
  ]);

  const [symbols, tokenBalances] = await Promise.all([
    sdk.api.abi.multiCall({
      block: chainBlocks["fantom"],
      calls: lpTokens.output.map((p) => ({
        target: p.output,
      })),
      abi: "erc20:symbol",
      chain: "fantom",
    }),
    sdk.api.abi.multiCall({
      block: chainBlocks["fantom"],
      calls: lpTokens.output.map((p) => ({
        target: p.output,
        params: MINICHEF,
      })),
      abi: "erc20:balanceOf",
      chain: "fantom",
    }),
  ]);

  const strategyBalances = await sdk.api.abi.multiCall({
    block: chainBlocks["fantom"],
    calls: strategies.output
      .filter(
        (strategy) =>
          strategy.output !== "0x0000000000000000000000000000000000000000"
      )
      .map((strategy) => ({
        target: strategy.output,
      })),
    abi: abi.balanceOf,
    chain: "fantom",
  });

  const lpPositions = [];
  let i = 0;

  tokenBalances.output.forEach((balance, idx) => {
    const strategy = strategies.output[idx].output;

    let totalBalance = new BigNumber(balance.output);

    if (strategy !== "0x0000000000000000000000000000000000000000") {
      totalBalance = totalBalance.plus(
        new BigNumber(strategyBalances.output[i].output)
      );
      i++;
    }

    const token = balance.input.target;
    if (symbols.output[idx].output.includes("LP")) {
      lpPositions.push({
        balance: totalBalance.toString(10),
        token,
      });
    } else {
      sdk.util.sumSingleBalance(
        balances,
        transformAddress(token),
        totalBalance.toString(10)
      );
    }
  });

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
  staking: {
    tvl: staking(xLQDR, LQDR, "fantom", "fantom:" + LQDR),
  },
  masterchef: {
    tvl: masterchefTvl,
  },
  minichef: {
    tvl: minichefTvl,
  },
  tvl: sdk.util.sumChainTvls([
    masterchefTvl,
    minichefTvl,
  ]),
};
