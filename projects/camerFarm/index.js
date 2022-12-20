const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const BigNumber = require("bignumber.js");

// --- All sushitokens lp tokens are staked here for LQDR tokens ---
const MASTERCHEF = "0xceFDbfaf8E0f5b52F57c435dAD670554aF57EBFF";

const shadowChefAddresses = [
  "0x5d6f09b7de6704d0209c2d91053300203bb78bb6", // CAMEL/WETH"
  "0x106AE154e4c24b6e11E70cfee7E075B14a182244", // SPIRIT/FTM
];

const masterchefTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const transformAddress = await transformFantomAddress();

  await addFundsInMasterChef(
    balances,
    MASTERCHEF,
    chainBlocks.arbitrum,
    "arbitrum",
    transformAddress,
    abi.poolInfo
  );

  return balances;
};


const shadowchefTvl = async (timestamp, ethBlock, chainBlocks) => {
  let balances = {};

  const transformAddress = await transformFantomAddress();

  const [lpTokens, strategies] = await Promise.all([
    sdk.api.abi.multiCall({
      block: chainBlocks["arbitrum"],
      calls: Array.from(Array(Number(shadowChefAddresses.length)).keys()).map((i) => ({
        target: shadowChefAddresses[i],
      })),
      abi: abi.shadowLpToken,
      chain: "arbitrum",
    }),
    sdk.api.abi.multiCall({
      block: chainBlocks["arbitrum"],
      calls: Array.from(Array(Number(shadowChefAddresses.length)).keys()).map((i) => ({
        target: shadowChefAddresses[i],
      })),
      abi: abi.shadowStrategy,
      chain: "arbitrum",
    }),
  ]);

  const [symbols, tokenBalances, strategyBalances] = await Promise.all([
    sdk.api.abi.multiCall({
      block: chainBlocks["arbitrum"],
      calls: lpTokens.output.map((p) => ({
        target: p.output,
      })),
      abi: "erc20:symbol",
      chain: "arbitrum",
    }),
    sdk.api.abi.multiCall({
      block: chainBlocks["arbitrum"],
      calls: lpTokens.output.map((p, index) => ({
        target: p.output,
        params: shadowChefAddresses[index],
      })),
      abi: "erc20:balanceOf",
      chain: "arbitrum",
    }),
    sdk.api.abi.multiCall({
      block: chainBlocks["arbitrum"],
      calls: strategies.output
        .filter(
          (strategy) =>
            strategy.output !== "0x0000000000000000000000000000000000000000"
        )
        .map((strategy) => ({
          target: strategy.output,
        })),
      abi: abi.balanceOf,
      chain: "arbitrum",
    })
  ]);

  const lpPositions = [];
  let i = 0;

  tokenBalances.output.forEach(async (balance, idx) => {
    const strategy = strategies.output[idx].output;

    let totalBalance = new BigNumber(balance.output);

    if (strategy !== "0x0000000000000000000000000000000000000000") {
      totalBalance = totalBalance.plus(
        new BigNumber(strategyBalances.output[i].output)
      );
      i++;
    }

    const token = balance.input.target;
    if (symbols.output[idx].success) {
      lpPositions.push({
        balance: totalBalance.toString(10),
        token,
      });
    }
  });

  const turns = Math.floor(lpPositions.length / 10);
  let n = 0;

  for (let i = 0; i < turns; i++) {
    await unwrapUniswapLPs(
      balances,
      lpPositions.slice(n, n + 10),
      chainBlocks["arbitrum"],
      "arbitrum",
      transformAddress
    );
    n += 10;
  }

  return balances;
};

module.exports = {
  fantom: {
    tvl: sdk.util.sumChainTvls([
      masterchefTvl,
      shadowchefTvl,
    ]),
  }
}; // node test.js projects/liquiddriver/index.js