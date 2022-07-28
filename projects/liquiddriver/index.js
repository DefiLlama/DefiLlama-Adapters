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
const wftmTokenAddress = "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83";
const spiritTokenAddress = "0x5Cc61A78F164885776AA610fb0FE1257df78E59B";
const hndTokenAddress = "0x10010078a54396F62c96dF8532dc2B4847d47ED3";
const beethovenVaultAddress = "0x20dd72Ed959b6147912C2e529F0a0C651c33c9ce";
const spiritLinspiritLpInSpirit = "0x54d5b6881b429a694712fa89875448ca8adf06f4";
const linspiritStakingAddress = "0x1CC765cD7baDf46A215bD142846595594AD4ffe3";
const linspiritTokenAddress = "0xc5713B6a0F26bf0fdC1c52B90cd184D950be515C";
const liHndStakingAddress = "0xdf2dA1E24ADa883366972A73d23d1aDDA8CF7CD2";
const liHndTokenAddress = "0xA147268f35Db4Ae3932eabe42AF16C36A8B89690";

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
      if (token === "0x936D23C83c2469f6a14B9f5bEaec13879598A5aC") { // ICE-FTM SPIRIT LP
        const [reserves, totalSupply] = await Promise.all([
          sdk.api.abi.call({
            abi: abi.getReserves,
            target: token,
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
        sdk.util.sumSingleBalance(
          balances,
          transformAddress(wftmTokenAddress),
          new BigNumber(Number(reserves.output[0])).times(2).times(lpTokenRatio).toFixed(0)
        );
      } else if (symbols.output[idx].output.includes("LP")) {
        if (lpTokens.output[idx].output === "0xD163415BD34EF06f57C58D2AEd5A5478AfB464cC") { // BeetXLP_MIM_USDC_USDT
          // DO NOTHING
        } else {
          lpPositions.push({
            balance: totalBalance.toString(10),
            token,
          });
        }
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
          const curveTvlInUsdt = totalBalance.times(virtual_price).div(1e30).toFixed(0);

          sdk.util.sumSingleBalance(
            balances,
            transformAddress(usdtTokenAddress),
            curveTvlInUsdt
          );
        } else if (lpTokens.output[idx].output === "0x30A92a4EEca857445F41E4Bb836e64D66920F1C0") { // BPT_LINSPIRIT LP
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
          const linspiritPriceInSpirit = new BigNumber(Number(reserves.output[0])).div(Number(reserves.output[1]))
          const linSpiritBalanceInSpirit = linspiritPriceInSpirit.times(Number(tokenBalances.output['1'][1]))
          const bptLinspiritTvlInSpirit = new BigNumber(Number(tokenBalances.output['1'][0])).plus(linSpiritBalanceInSpirit).times(lpTokenRatio).toFixed(0);
          sdk.util.sumSingleBalance(
            balances,
            transformAddress(spiritTokenAddress),
            bptLinspiritTvlInSpirit
          );
        } else if (lpTokens.output[idx].output === "0xf3A602d30dcB723A74a0198313a7551FEacA7DAc") { // BPT-QUARTET LP
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
          const bptQuartetTvlInUsdc = new BigNumber(tokenBalances.output['1'][0]).times(4).times(lpTokenRatio).toFixed(0);
          sdk.util.sumSingleBalance(
            balances,
            transformAddress(usdcTokenAddress),
            bptQuartetTvlInUsdc
          );
        } else if (lpTokens.output[idx].output === "0xcdF68a4d525Ba2E90Fe959c74330430A5a6b8226") { // FTM-OPERA LP
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
          const ftmOperaTvlInUsdc = new BigNumber(tokenBalances.output['1'][0]).times(100).div(30).times(lpTokenRatio).toFixed(0);
          sdk.util.sumSingleBalance(
            balances,
            transformAddress(usdcTokenAddress),
            ftmOperaTvlInUsdc
          );
        } else if (lpTokens.output[idx].output === "0x8F6a658056378558fF88265f7c9444A0FB4DB4be") { // BPT_liHND LP
          const [tokenBalances, totalSupply] = await Promise.all([
            sdk.api.abi.call({
              abi: abi.getPoolTokens,
              target: beethovenVaultAddress,
              params: ["0x8f6a658056378558ff88265f7c9444a0fb4db4be0002000000000000000002b8"],
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
          const bptLiHndTvlInHnd = new BigNumber(Number(tokenBalances.output['1'][0])).times(2).times(lpTokenRatio).toFixed(0);
          sdk.util.sumSingleBalance(
            balances,
            transformAddress(hndTokenAddress),
            bptLiHndTvlInHnd
          );
        } else if (lpTokens.output[idx].output === "0x8B858Eaf095A7337dE6f9bC212993338773cA34e") { // DEI-USDC LP
          const [tokenBalances, totalSupply] = await Promise.all([
            sdk.api.abi.call({
              abi: abi.getPoolTokens,
              target: beethovenVaultAddress,
              params: ["0x8b858eaf095a7337de6f9bc212993338773ca34e00020000000000000000023c"],
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
          const bptDeiUsdcTvlInUsdc = new BigNumber(Number(tokenBalances.output['1'][1])).div(1e12).plus(Number(tokenBalances.output['1'][0])).times(lpTokenRatio).toFixed(0);
          sdk.util.sumSingleBalance(
            balances,
            transformAddress(usdcTokenAddress),
            bptDeiUsdcTvlInUsdc
          );
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

  // linspirit staking tvl
  const linspiritStakedBalance = ((await sdk.api.abi.call({
    chain: 'fantom',
    block: chainBlocks['fantom'],
    target: linspiritTokenAddress,
    abi: 'erc20:balanceOf',
    params: linspiritStakingAddress
  })).output);

  sdk.util.sumSingleBalance(
    balances,
    transformAddress(spiritTokenAddress),
    linspiritStakedBalance
  );

  // lihnd staking tvl
  const liHndStakedBalance = ((await sdk.api.abi.call({
    chain: 'fantom',
    block: chainBlocks['fantom'],
    target: liHndTokenAddress,
    abi: 'erc20:balanceOf',
    params: liHndStakingAddress
  })).output);

  sdk.util.sumSingleBalance(
    balances,
    transformAddress(hndTokenAddress),
    liHndStakedBalance
  );

  return balances;
};

const hundredchefTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  const transformAddress = await transformFantomAddress();

  const hdaiChefAddress = "0x79364E45648Db09eE9314E47b2fD31c199Eb03B9";
  const husdcChefAddress = "0x9A07fB107b9d8eA8B82ECF453Efb7cFb85A66Ce9";
  const hmimChefAddress = "0xeD566B089Fc80Df0e8D3E0AD3aD06116433Bf4a7";
  const hfraxChefAddress = "0x669F5f289A5833744E830AD6AB767Ea47A3d6409";

  const chefAddressess = [
    hdaiChefAddress,
    husdcChefAddress,
    hmimChefAddress,
    hfraxChefAddress,
  ];

  for (let index = 0; index < chefAddressess.length; index++) {
    const chefAddress = chefAddressess[index];
    const token = ((await sdk.api.abi.call({
      chain: 'fantom',
      block: chainBlocks['fantom'],
      target: chefAddress,
      abi: abi.lpToken,
      params: 0
    })).output);

    const exchangeRateStored = ((await sdk.api.abi.call({
      chain: 'fantom',
      block: chainBlocks['fantom'],
      target: token,
      abi: abi.exchangeRateStored,
    })).output);

    const strategyAddress = ((await sdk.api.abi.call({
      chain: 'fantom',
      block: chainBlocks['fantom'],
      target: chefAddress,
      abi: abi.strategies,
      params: 0
    })).output);

    const strategyBalanace = ((await sdk.api.abi.call({
      chain: 'fantom',
      block: chainBlocks['fantom'],
      target: strategyAddress,
      abi: abi.balanceOf,
    })).output);

    sdk.util.sumSingleBalance(
      balances,
      transformAddress(usdcTokenAddress),
      new BigNumber(Number(strategyBalanace)).times(exchangeRateStored).div(chefAddress === husdcChefAddress ? 1e18 : 1e30).toFixed(0)
    );
  };

  return balances;
};

module.exports = {
  fantom: {
    staking: staking(xLQDR, LQDR, "fantom", "fantom:" + LQDR),
    tvl: sdk.util.sumChainTvls([
      masterchefTvl,
      minichefTvl,
      hundredchefTvl,
    ]),
  }
}; // node test.js projects/liquiddriver/index.js