const ADDRESSES = require('../helper/coreAssets.json')
const { stakingUnknownPricedLP } = require("../helper/staking");
const farmUtils = require("./farm-utils");
const vaultUtils = require("./vault-utils")

const sdk = require("@defillama/sdk");
const sky = "0x9D3BBb0e988D9Fb2d55d07Fe471Be2266AD9c81c";
const boardroom = "0x2e7d17ABCb9a2a40ec482B2ac9a9F811c12Bf630";


async function pool2(timestamp, block, chainBlocks) {
  // SKY POOL
  const farmTvl = await farmUtils.farmLocked(chainBlocks["cronos"]);
  let balances = {};

  //add CRO balance in LP pool
  sdk.util.sumSingleBalance(
    balances,
    "cronos:" + ADDRESSES.cronos.WCRO_1,
    farmTvl["cronos:" + ADDRESSES.cronos.WCRO_1]
  );

  //add Dark and Sky balance in LP pool
  sdk.util.sumSingleBalance(
    balances,
    "cronos:" + ADDRESSES.cronos.WCRO_1,
    farmTvl["cronos:" + ADDRESSES.cronos.WCRO_1],
  );

  return balances;
}

async function vault(api){
  return vaultUtils.vaultLocked(api)
}

module.exports = {
  doublecounted: true,
  cronos: {
    tvl:vault,
    pool2,
    staking: stakingUnknownPricedLP(
      boardroom,
      sky,
      "cronos",
      "0xaA0845EE17e4f1D4F3A8c22cB1e8102baCf56a77"
    ),
    
  },
};
