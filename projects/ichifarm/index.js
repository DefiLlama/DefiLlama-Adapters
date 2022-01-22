const sdk = require("@defillama/sdk");
const abiOneToken = require("./abiOneToken.json");
const abiFarm = require("./abiFarm.json");
const BigNumber = require("bignumber.js");
const { fetchURL } = require("../helper/utils");
const { staking } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const Contracts = [
  // StakingConract
  "0x70605a6457B0A8fBf1EEE896911895296eAB467E",
  //farmV1Contract
  "0xcC50953A743B9CE382f423E37b07Efa6F9d9B000",
  //farmV2Contract
  "0x275dFE03bc036257Cd0a713EE819Dbd4529739c8",
];
const ICHI = "0x903bEF1736CDdf2A537176cf3C64579C3867A881";

const ignoreAddresses = [
  "0x22c6289dB7E8EAB6aA12C35a044410327c4d9F93",
  "0x1dcE26F543E591c27717e25294AEbbF59AD9f3a5",
  "0x46935b2489d1468A580CcC3ccbA11D1eb7737199",
  "0xfaeCcee632912c42a7c88c3544885A8D455408FA",
];

const OneTokenFactoryContract = "0xD0092632B9Ac5A7856664eeC1abb6E3403a6A36a";

const oneTokensV1 = [
  "0xC88F47067dB2E25851317A2FDaE73a22c0777c37",
  "0xEc0d77a58528a218cBf41Fa6E1585c8D7A085868",
  "0x18Cc17a1EeD37C02A77B0B96b7890C7730E2a2CF",
  "0x8F041A3940a5e6FB580075C3774E15FcFA0E1618",
  "0x7BD198b9107496fD5cC3d7655AF52f43a8eDBc4C",
];

const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const endpoint =
  "https://raw.githubusercontent.com/ichifarm/ichi/main/ichi-tokenlist.json";

const Staking = async (...params) => {
  for (const stakingContract of Contracts) {
    return staking(stakingContract, ICHI)(...params);
  }
};

const calc = async (block, balances, farm, poolLength, lpToken, lpBalance) => {
  const lengthOfPool = (
    await sdk.api.abi.call({
      abi: poolLength,
      target: farm,
      block,
    })
  ).output;

  const lpPositions = [];

  for (let i = 0; i < lengthOfPool; i++) {
    const tokenLp = (
      await sdk.api.abi.call({
        abi: lpToken,
        target: farm,
        params: i,
        block,
      })
    ).output;

    const balanceLp = (
      await sdk.api.abi.call({
        abi: lpBalance,
        target: farm,
        params: i,
        block,
      })
    ).output;

    const lpSymbol = (
      await sdk.api.abi.call({
        abi: abiFarm.symbol,
        target: tokenLp,
        block,
      })
    ).output;

    if (
      ignoreAddresses.some(
        (addr) => addr.toLowerCase() === tokenLp.toLowerCase()
      )
    ) {
    } else if (lpSymbol.includes("LP") || lpSymbol.includes("UNI-V2")) {
      lpPositions.push({
        token: tokenLp,
        balance: balanceLp,
      });
    } else if (lpSymbol == "BPT") {
      const getCrTokens = (
        await sdk.api.abi.call({
          abi: abiFarm.getCurrentTokens,
          target: tokenLp,
          block,
        })
      ).output;

      for (const token of getCrTokens) {
        await sumTokensAndLPsSharedOwners(
          balances,
          [[token, false]],
          [tokenLp]
        );
      }
    } else {
      sdk.util.sumSingleBalance(balances, tokenLp, balanceLp);
    }
  }

  await unwrapUniswapLPs(balances, lpPositions, block);
};

const ethTvl = async (block) => {
  const balances = {};

  /*** ICHI oneTokens V1 TVL Portion ***/
  const assetsList = (await fetchURL(endpoint)).data.tokens
    .map((addr) => addr.address)
    .concat(USDC);

  for (const asset of assetsList) {
    await sumTokensAndLPsSharedOwners(balances, [[asset, false]], oneTokensV1);
  }

  /*** ICHI Farm V1 TVL Portion ***/
  await calc(
    block,
    balances,
    Contracts[1],
    abiFarm.poolLength,
    abiFarm.getPoolToken,
    abiFarm.getLPSupply
  );

  /*** ICHI oneTokens V2 TVL Portion ***/
  const countOneTokens = (
    await sdk.api.abi.call({
      abi: abiOneToken.oneTokenCount,
      target: OneTokenFactoryContract,
      block,
    })
  ).output;

  for (let i = 0; i < countOneTokens; i++) {
    const oneToken = (
      await sdk.api.abi.call({
        abi: abiOneToken.oneTokenAtIndex,
        target: OneTokenFactoryContract,
        params: i,
        block,
      })
    ).output;

    const totalSuplay = (
      await sdk.api.abi.call({
        abi: abiOneToken.totalSupply,
        target: oneToken,
        block,
      })
    ).output;

    const totalBalance = BigNumber(totalSuplay).div(1e12).toFixed(0);

    sdk.util.sumSingleBalance(balances, USDC, totalBalance);
  }

  /*** ICHI Farm V2 TVL Portion ***/
  await calc(
    block,
    balances,
    Contracts[2],
    abiFarm.poolLength,
    abiFarm.lpToken,
    abiFarm.getLPSupply
  );
  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: Staking,
    tvl: ethTvl,
  },
  methodology:
    "We count liquidity on the oneTokens and Farm seccions through oneTokenfactor and Farm Contracts",
};
