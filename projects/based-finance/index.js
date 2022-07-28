const sdk = require("@defillama/sdk");
const { unwrapCrv, unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const bshareRewardPoolAddress = "0xac0fa95058616d7539b6eecb6418a68e7c18a746";
const acropolisAddress = "0xe5009dd5912a68b0d7c6f874cd0b4492c9f0e5cd";
const treasuryAddress = "0xa0e0f462d66de459711bc721ce1fdcc3d9405831";

// Token Addresses
const basedTokenAddress = "0x8d7d3409881b51466b483b11ea1b8a03cded89ae";
const bshareTokenAddress = "0x49c290ff692149a4e16611c694fded42c954ab7a";
const tombAddress = "0x6c021ae822bea943b2e66552bde1d2696a53fbb7";
const usdcAddress = "0x04068da6c83afcfa0e13ba15a6696662335d5b75";
const usdtAddress = "0x049d68029688eAbF473097a2fC38ef61633A3C7A";
const maiAddress = "0xfB98B335551a418cD0737375a2ea0ded62Ea213b";
const wftmAddress = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83";
const tshareAddress = "0x4cdF39285D7Ca8eB3f090fDA0C069ba5F4145B37";

// LP Addresses
const basedTombLpAddress = "0xab2ddcbb346327bbdf97120b0dd5ee172a9c8f9e";
const bshareFtmLpAddress = "0x6f607443dc307dcbe570d0ecff79d65838630b56";
const basedBshareLpAddress = "0x5748b5Dd1f59342f85d170c48C427959c2f9f262";
const basedMaiTSwapLpAddress = "0x7B5B3751550be4FF87aC6bda89533F7A0c9825B3";
const basedTombTSwapLpAddress = "0x172BFaA8991A54ABD0b3EE3d4F8CBDab7046FF79";
const basedUsdcTSwapLpAddress = "0x7c849a7E2cb08f09cf37482cc0A04ecB5891844a";
const g3CrvAddress = "0xd02a30d33153877bc20e5721ee53dedee0422b2f";
const crv3CryptoAddress = "0x58e57cA18B7A47112b877E31929798Cd3D703b0f";

const poolLPs = [
  basedTombLpAddress,
  bshareFtmLpAddress,
  basedBshareLpAddress,
  basedMaiTSwapLpAddress,
  basedTombTSwapLpAddress,
  basedUsdcTSwapLpAddress,
  g3CrvAddress,
  crv3CryptoAddress,
];

const treasuryTokens = [
  basedBshareLpAddress,
  basedMaiTSwapLpAddress,
  basedTombTSwapLpAddress,
  basedUsdcTSwapLpAddress,
  g3CrvAddress,
  crv3CryptoAddress,
  tombAddress,
  usdcAddress,
  usdtAddress,
  wftmAddress,
  basedTokenAddress,
  bshareTokenAddress,
  tshareAddress,
  maiAddress,
];

async function calcPool2(rewardPool, lps, block, chain) {
  let balances = {};
  const lpBalances = (
    await sdk.api.abi.multiCall({
      calls: lps.map((p) => ({
        target: p,
        params: rewardPool,
      })),
      abi: "erc20:balanceOf",
      block,
      chain,
    })
  ).output;

  let lpPositions = [];
  lpBalances.slice(0, 6).forEach((p) => {
    lpPositions.push({
      balance: p.output,
      token: p.input.target,
    });
  });

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    chain,
    (addr) => `${chain}:${addr}`
  );

  await unwrapCrv(
    balances,
    g3CrvAddress,
    lpBalances[6].output,
    block,
    chain,
    (addr) => `${chain}:${addr}`
  );

  await unwrapCrv(
    balances,
    crv3CryptoAddress,
    lpBalances[7].output,
    block,
    chain,
    (addr) => `${chain}:${addr}`
  );

  return balances;
}

async function calcTreasury(treasury, tokens, block, chain) {
  let balances = {};

  const tokenBalances = (
    await sdk.api.abi.multiCall({
      calls: tokens.map((p) => ({
        target: p,
        params: treasury,
      })),
      abi: "erc20:balanceOf",
      block,
      chain,
    })
  ).output;

  let lpPositions = [];
  tokenBalances.slice(0, 4).forEach((p) => {
    lpPositions.push({
      balance: p.output,
      token: p.input.target,
    });
  });

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    chain,
    (addr) => `${chain}:${addr}`
  );

  await unwrapCrv(
    balances,
    g3CrvAddress,
    tokenBalances[4].output,
    block,
    chain,
    (addr) => `${chain}:${addr}`
  );

  await unwrapCrv(
    balances,
    crv3CryptoAddress,
    tokenBalances[5].output,
    block,
    chain,
    (addr) => `${chain}:${addr}`
  );

  tokenBalances.slice(6).forEach((balance) => {
    sdk.util.sumSingleBalance(balances, `${chain}:${balance.input.target}`, balance.output);
  });

  return balances;
}

async function pool2(timestamp, block, chainBlocks) {
  return await calcPool2(bshareRewardPoolAddress, poolLPs, chainBlocks.fantom, "fantom");
}

async function treasury(timestamp, block, chainBlocks) {
  return await calcTreasury(treasuryAddress, treasuryTokens, chainBlocks.fantom, "fantom");  
}

module.exports = {
  methodology: "Pool2 deposits consist of BASED/TOMB, BSHARE/FTM LP, g3CRV (geist stable LP on Curve) receipt tokens while the staking TVL consists of the BSHARES tokens locked within the Acropolis contract. Treasury consists of deposit fees accumulated from genesis pools as well as g3CRV pool",
  fantom: {
    tvl: async () => ({}),
    pool2,
    staking: staking(acropolisAddress, bshareTokenAddress, "fantom"),
    treasury
  },
};

// node test.js projects/based-finance/index.js
