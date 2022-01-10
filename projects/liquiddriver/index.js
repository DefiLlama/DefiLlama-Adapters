const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const BigNumber = require("bignumber.js");

// --- All sushitokens lp tokens are staked here for LQDR tokens ---
const MASTERCHEF = "0x742474dae70fa2ab063ab786b1fbe5704e861a0c";
const MINICHEF = "0x6e2ad6527901c9664f016466b8DA1357a004db0f";
const usdtTokenAddress = "0x049d68029688eabf473097a2fc38ef61633a3c7a";
const usdcTokenAddress = "0x04068da6c83afcfa0e13ba15a6696662335d5b75";
const spiritTokenAddress = "0x5Cc61A78F164885776AA610fb0FE1257df78E59B";
const beethovenVaultAddress = "0x20dd72Ed959b6147912C2e529F0a0C651c33c9ce";
const spiritLinspiritLpInSpirit = "0x54d5b6881b429a694712fa89875448ca8adf06f4";

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
  let balances = {};
  let curveTvlInUsdt;
  let bptLinspiritTvlInSpirit;
  let bptQuartetTvlInUsdc;
  let ftmOperaTvlInUsdc;
  let linspiritPriceInSpirit

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

  const [symbols, tokenBalances, strategyBalances] = await Promise.all([
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
    sdk.api.abi.multiCall({
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
      if (symbols.output[idx].output.includes("LP") && symbols.output[idx].output != "BeetXLP_MIM_USDC_USDT") {
        lpPositions.push({
          balance: totalBalance.toString(10),
          token,
        });
      } else {
        if (symbols.output[idx].output === "3poolV2-f") {
          const virtual_price = (
            await sdk.api.abi.call({
              abi: abi.get_virtual_price,
              target: token,
              chain: "fantom",
              block: chainBlocks["fantom"],
            })
          ).output;
          curveTvlInUsdt = totalBalance.times(virtual_price).div(1e30).toFixed(0);
        } else if (symbols.output[idx].output === "BPT_LINSPIRIT") {
          const [tokenBalances, reserves, totalSupply] = await Promise.all([
            sdk.api.abi.call({
              abi: abi.getPoolTokens,
              target: beethovenVaultAddress,
              params: ["0x30a92a4eeca857445f41e4bb836e64d66920f1c0000200000000000000000071"],
              chain: "fantom",
              block: chainBlocks["fantom"],
            }),
            sdk.api.abi.call({
              abi: abi.getReserves,
              target: spiritLinspiritLpInSpirit,
              chain: "fantom",
              block: chainBlocks["fantom"],
            }),
            sdk.api.abi.call({
              abi: abi.totalSupply,
              target: token,
              chain: "fantom",
              block: chainBlocks["fantom"],
            }),
          ]);
          const lpTokenRatio = new BigNumber(totalSupply.output).isZero() ? new BigNumber(0) : totalBalance.div(totalSupply.output);
          linspiritPriceInSpirit = new BigNumber(Number(reserves.output[0])).div(Number(reserves.output[1]))
          const linSpiritBalanceInSpirit = linspiritPriceInSpirit.times(Number(tokenBalances.output['1'][1]))
          bptLinspiritTvlInSpirit = new BigNumber(Number(tokenBalances.output['1'][0])).plus(linSpiritBalanceInSpirit).times(lpTokenRatio).toFixed(0);
        } else if (symbols.output[idx].output === "BPT-QUARTET") {
          const [tokenBalances, totalSupply] = await Promise.all([
            sdk.api.abi.call({
              abi: abi.getPoolTokens,
              target: beethovenVaultAddress,
              params: ["0xf3a602d30dcb723a74a0198313a7551feaca7dac00010000000000000000005f"],
              chain: "fantom",
              block: chainBlocks["fantom"],
            }),
            sdk.api.abi.call({
              abi: abi.totalSupply,
              target: token,
              chain: "fantom",
              block: chainBlocks["fantom"],
            }),
          ]);
          const lpTokenRatio = new BigNumber(totalSupply.output).isZero() ? new BigNumber(0) : totalBalance.div(totalSupply.output);
          bptQuartetTvlInUsdc = new BigNumber(tokenBalances.output['1'][0]).times(4).times(lpTokenRatio).toFixed(0);
        } else if (symbols.output[idx].output === "FTM-OPERA") {
          const [tokenBalances, totalSupply] = await Promise.all([
            sdk.api.abi.call({
              abi: abi.getPoolTokens,
              target: beethovenVaultAddress,
              params: ["0xcdf68a4d525ba2e90fe959c74330430a5a6b8226000200000000000000000008"],
              chain: "fantom",
              block: chainBlocks["fantom"],
            }),
            sdk.api.abi.call({
              abi: abi.totalSupply,
              target: token,
              chain: "fantom",
              block: chainBlocks["fantom"],
            }),
          ]);
          const lpTokenRatio = new BigNumber(totalSupply.output).isZero() ? new BigNumber(0) : totalBalance.div(totalSupply.output);
          ftmOperaTvlInUsdc = new BigNumber(tokenBalances.output['1'][0]).times(100).div(30).times(lpTokenRatio).toFixed(0);
        } else {
          sdk.util.sumSingleBalance(
            balances,
            transformAddress(token),
            totalBalance.toString(10)
          );
        }
      }
    }
  });

  const beetXLP_MIM_USDC_USDT = 'fantom:0xD163415BD34EF06f57C58D2AEd5A5478AfB464cC';

  if (beetXLP_MIM_USDC_USDT in balances) {
    sdk.util.sumSingleBalance(
      balances,
      transformAddress(usdtTokenAddress),
      Math.round(balances[beetXLP_MIM_USDC_USDT] / 10 ** 12)
    );
    delete balances[beetXLP_MIM_USDC_USDT];
  };

  const turns = Math.floor(lpPositions.length / 10);
  let n = 0;

  for (let i = 0; i < turns; i++) {
    await unwrapUniswapLPs(
      balances,
      lpPositions.slice(n, n + 10),
      chainBlocks["fantom"],
      "fantom",
      transformAddress
    );
    n += 10;
  }

  sdk.util.sumSingleBalance(
    balances,
    transformAddress(usdtTokenAddress),
    curveTvlInUsdt
  );
  sdk.util.sumSingleBalance(
    balances,
    transformAddress(spiritTokenAddress),
    bptLinspiritTvlInSpirit
  );
  sdk.util.sumSingleBalance(
    balances,
    transformAddress(usdcTokenAddress),
    bptQuartetTvlInUsdc
  );
  sdk.util.sumSingleBalance(
    balances,
    transformAddress(usdcTokenAddress),
    ftmOperaTvlInUsdc
  );

  return balances;
};

module.exports = {
  fantom: {
    staking: staking(xLQDR, LQDR, "fantom", "fantom:" + LQDR),
    tvl: sdk.util.sumChainTvls([
      masterchefTvl,
      minichefTvl,
    ]),
  }
};
