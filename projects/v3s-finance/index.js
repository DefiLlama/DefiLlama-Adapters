const ADDRESSES = require('../helper/coreAssets.json')
const { addFundsInMasterChef } = require("../helper/masterchef");
const { stakingUnknownPricedLP, stakingPricedLP } = require("../helper/staking");

const sdk = require("@defillama/sdk");
const { pool2 } = require('../helper/pool2');
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

module.exports = {
  cronos: {
    tvl: tvl,
    pool2: pool2(vShareRewardsAddr, pool2LPs),
    staking: stakingPricedLP(boardroom, vshare, "cronos", vShareCroAddress, "wrapped-cro")
  },
};
