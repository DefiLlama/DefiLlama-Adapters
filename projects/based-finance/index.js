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
const wftmAddress = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83";
const ethAddress = "0x74b23882a30290451a17c44f4f05243b6b58c76d";

// LP Addresses
const basedTombLpAddress = "0xab2ddcbb346327bbdf97120b0dd5ee172a9c8f9e";
const bshsareFtmLpAddress = "0x6f607443dc307dcbe570d0ecff79d65838630b56";
const g3CrvAddress = "0xd02a30d33153877bc20e5721ee53dedee0422b2f";
const stakedG3CrvAddress = "0xd4f94d0aaa640bbb72b5eec2d85f6d114d81a88e";

const poolLPs = [
  basedTombLpAddress,
  bshsareFtmLpAddress,
  stakedG3CrvAddress,
];

const treasuryTokens = [
  basedTombLpAddress,
  stakedG3CrvAddress,
  tombAddress,
  usdcAddress,
  wftmAddress,
  ethAddress,
]

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
  lpBalances.slice(0, 2).forEach((p) => {
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
    g3CrvAddress, // sending address of g3Crv LP instead of receipt token. Both have same value.
    lpBalances[2].output,
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
        params: treasuryAddress,
      })),
      abi: "erc20:balanceOf",
      block,
      chain,
    })
  ).output;

  const lpPositions = [{ balance: tokenBalances[0].output, token: tokenBalances[0].input.target }];
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    chain,
    (addr) => `${chain}:${addr}`
  );

  await unwrapCrv(
    balances,
    g3CrvAddress, // sending address of g3Crv LP instead of receipt token. Both have same value.
    tokenBalances[1].output,
    block,
    chain,
    (addr) => `${chain}:${addr}`
  );

  tokenBalances.slice(2).map((balance) => {
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
  methodology: "Pool2 deposits consist of BASED/TOMB and BSHARE/FTM LP tokens deposits while the staking TVL consists of the BSHARES tokens locked within the Acropolis contract(0xe5009dd5912a68b0d7c6f874cd0b4492c9f0e5cd).",
  fantom: {
    tvl: async () => ({}),
    pool2,
    staking: staking(acropolisAddress, bshareTokenAddress, "fantom"),
    treasury
  },
};

// node test.js projects/based-finance/index.js
