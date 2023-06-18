const ADDRESSES = require('../helper/coreAssets.json')
const { addFundsInMasterChef } = require("../helper/masterchef");
const { stakingUnknownPricedLP, stakingPricedLP } = require("../helper/staking");
const farmUtils = require("./farm-utils");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const sdk = require("@defillama/sdk");
const v3s = "0xC7e99a2f064Cf86aF91Db252a9D8Bc16e6fE7427";
const vshare = "0xdcC261c03cD2f33eBea404318Cdc1D9f8b78e1AD";
const krx = "0xf0681bb7088ac68a62909929554aa22ad89a21fb";
const krx_usdc = "0x9504a7cEd300B2C79e64FC63f368fC27011Fe916";
const masterchefV3S = "0xEe38B8d70382c50cDD020785D0aC551d259Cec84";
const boardroom = "0x3F728308A0fb99a8cE4F3F4F87E4e67a38F66746";
const v3sVvspAddress = "0x57b975364140e4a8d1C96FAa00225b855BaB0E8E";
const vShareCroAddress = "0xcb0704BC4E885384ac96F0ED22B9204C3adD91AD"
const vShareRewardsAddr = "0x569608516A81C0B1247310A3E0CD001046dA0663";

const usdc = ADDRESSES.cronos.USDC.toLowerCase();

async function tvl(timestamp, block, chainBlocks) {
  let balances = {};

  //V3S Reward Pools
  await addFundsInMasterChef(
    balances,
    masterchefV3S,
    chainBlocks.cronos,
    "cronos",
    (addr) => `cronos:${addr}`,
    undefined,
    [krx,],
    true,
    true,
    vshare
  );

  //get staking KRX token. Have to calculate manually becase cannot get KRX price
  let krxBalance = await stakingUnknownPricedLP(
    masterchefV3S,
    krx,
    "cronos",
    krx_usdc
  )(timestamp, block, chainBlocks);
  sdk.util.sumSingleBalance(
    balances,
    `cronos:${usdc}`,
    krxBalance[`cronos:${usdc}`]
  );

  return balances;
}

const pool2LPs = [
  v3sVvspAddress,
  vShareCroAddress,
];

async function calcPool2(masterchef, lps, block, chain) {
  let balances = {};
  const lpBalances = (
    await sdk.api.abi.multiCall({
      calls: lps.map((p) => ({
        target: p,
        params: masterchef,
      })),
      abi: "erc20:balanceOf",
      block,
      chain,
    })
  ).output;
  let lpPositions = [];
  lpBalances.forEach((p) => {
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
  return balances;
}

async function v3sPool2(timestamp, block, chainBlocks) {
  return await calcPool2(vShareRewardsAddr, pool2LPs, chainBlocks.cronos, "cronos");
}

module.exports = {
  cronos: {
    tvl: tvl,
    pool2: v3sPool2,
    staking: stakingPricedLP(boardroom, vshare, "cronos", vShareCroAddress, "wrapped-cro")
  },
};
