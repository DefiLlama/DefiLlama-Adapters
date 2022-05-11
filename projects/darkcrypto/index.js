const { addFundsInMasterChef } = require("../helper/masterchef");
const { stakingUnknownPricedLP } = require("../helper/staking");
const { pool2BalanceFromMasterChef } = require("../helper/pool2");
const farmUtils = require("./farm-utils");
const vaultUtils = require("./vault-utils")

const sdk = require("@defillama/sdk");
const dark = "0x83b2AC8642aE46FC2823Bc959fFEB3c1742c48B5";
const sky = "0x9D3BBb0e988D9Fb2d55d07Fe471Be2266AD9c81c";
const krx = "0xf0681bb7088ac68a62909929554aa22ad89a21fb";
const krx_usdc = "0x9504a7cEd300B2C79e64FC63f368fC27011Fe916";
const masterchefDark = "0x28d81863438F25b6EC4c9DA28348445FC5E44196";
const boardroom = "0x2e7d17ABCb9a2a40ec482B2ac9a9F811c12Bf630";

async function tvl(timestamp, block, chainBlocks) {
  let balances = await vaultUtils.vaultLocked(block, "cronos");

  //DARK POOL
  await addFundsInMasterChef(
    balances,
    masterchefDark,
    chainBlocks.cronos,
    "cronos",
    (addr) => `cronos:${addr}`,
    undefined,
    [dark, krx],
    true,
    true,
    dark,
  );
/*
  //get staking KRX token
  let krxBalance = await stakingUnknownPricedLP(
    masterchefDark,
    krx,
    "cronos",
    krx_usdc
  )(timestamp, block, chainBlocks);
  sdk.util.sumSingleBalance(
    balances,
    "cronos:0xc21223249CA28397B4B6541dfFaEcC539BfF0c59",
    krxBalance["cronos:0xc21223249CA28397B4B6541dfFaEcC539BfF0c59"]
  );

  

  //BoardRoom
  let boardroomBalance = await stakingUnknownPricedLP(
    boardroom,
    sky,
    "cronos",
    "0xaA0845EE17e4f1D4F3A8c22cB1e8102baCf56a77"
  )(timestamp, block, chainBlocks);
  sdk.util.sumSingleBalance(
    balances,
    "cronos:0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
    boardroomBalance["cronos:0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23"]
  );*/

  return balances;
}
async function pool2(timestamp, block, chainBlocks) {
  // SKY POOL
  const farmTvl = await farmUtils.farmLocked(chainBlocks["cronos"]);
  let balances = {};

  //add CRO balance in LP pool
  sdk.util.sumSingleBalance(
    balances,
    "cronos:0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
    farmTvl["cronos:0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23"]
  );

  //add Dark and Sky balance in LP pool
  sdk.util.sumSingleBalance(
    balances,
    "cronos:0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
    farmTvl["cronos:0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23"],
  );

  return balances;
}

async function vault(timestamp, block, chainBlocks){
  return await vaultUtils.vaultLocked(chainBlocks.cronos, 'cronos')
}

module.exports = {
  doublecounted: true,
  cronos: {
    tvl:vault,
    pool2: pool2,
    staking: stakingUnknownPricedLP(
      boardroom,
      sky,
      "cronos",
      "0xaA0845EE17e4f1D4F3A8c22cB1e8102baCf56a77"
    ),
    
  },
};
