const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const erc20 = require("../helper/abis/erc20.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformBscAddress, transformPolygonAddress } = require("../helper/portedTokens");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const masterChefContractBsc = "0x738600B15B2b6845d7Fe5B6C7Cb911332Fb89949";
const masterChefContractPolygon = "0x955d453892B0BA8DFc3929E7c83a6D07AFf2654a";

const retroStakings = [
  "0xd3a1adD0a8377f67932b61d13A2c01325C41c138",
  "0xD8907e29D9945609649C001a7b9317cDF23409C5",
];

const stakingTokens = [
  //TCG2
  "0xf73d8276c15ce56b2f4aee5920e62f767a7f3aea",
  //QBERT
  "0x6ed390befbb50f4b492f08ea0965735906034f81",
];

const calcTvl = async (
  balances,
  chain,
  block,
  masterchef,
  transformAddress
) => {
  const poolLength = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: masterchef,
      chain,
      block,
    })
  ).output;

  const lpPositions = [];

  for (let index = 0; index < poolLength; index++) {
    const strat = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: masterchef,
        params: index,
        chain,
        block,
      })
    ).output.strat;

    const want = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: masterchef,
        params: index,
        chain,
        block,
      })
    ).output.want;

    const strat_bal = (
      await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: want,
        params: strat,
        chain,
        block,
      })
    ).output;

    const symbol = (
      await sdk.api.abi.call({
        abi: abi.symbol,
        target: want,
        chain,
        block,
      })
    ).output;

    if (symbol.includes("LP")) {
      lpPositions.push({
        token: want,
        balance: strat_bal,
      });
    } else {
      sdk.util.sumSingleBalance(balances, `${chain}:${want}`, strat_bal);
    }
  }

  await unwrapUniswapLPs(balances, lpPositions, block, chain, transformAddress);
};

const bscTvl = async (chainBlocks) => {
  const balances = {};

  const transformAddress = await transformBscAddress();

  await calcTvl(
    balances,
    "bsc",
    chainBlocks["bsc"],
    masterChefContractBsc,
    transformAddress
  );

  for (const token of stakingTokens) {
    await sumTokensAndLPsSharedOwners(
      balances,
      [[token, false]],
      retroStakings,
      chainBlocks["bsc"],
      "bsc",
      transformAddress
    );
  }

  return balances;
};

const polygonTvl = async (chainBlocks) => {
  const balances = {};

  const transformAddress = await transformPolygonAddress();

  await calcTvl(
    balances,
    "polygon",
    chainBlocks["polygon"],
    masterChefContractPolygon,
    transformAddress
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: bscTvl,
  },
  polygon: {
    tvl: polygonTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl, polygonTvl]),
  methodology:
    "We count liquidity on the Farms through MasterChef contracts; and Saking of TCG2 and QBERT tokens through retroStaking contracts",
};
