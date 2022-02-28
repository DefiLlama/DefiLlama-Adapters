const { addFundsInMasterChef } = require("../helper/masterchef");
const { stakingUnknownPricedLP } = require("../helper/staking");
const farmUtils = require("./farm-utils");

const sdk = require("@defillama/sdk");
const v3s = "0xC7e99a2f064Cf86aF91Db252a9D8Bc16e6fE7427";
const vshare = "0xdcC261c03cD2f33eBea404318Cdc1D9f8b78e1AD";
const krx = "0xf0681bb7088ac68a62909929554aa22ad89a21fb";
const krx_usdc = "0x9504a7cEd300B2C79e64FC63f368fC27011Fe916";
const masterchefV3S = "0xEe38B8d70382c50cDD020785D0aC551d259Cec84";
const boardroom = "0x3F728308A0fb99a8cE4F3F4F87E4e67a38F66746";

const usdc = "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59";

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
    [krx, v3s],
    true,
    true,
    v3s
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

async function pool2(timestamp, block, chainBlocks) {
  let balances = {};
  // v3s LP
  const farmTvl = await farmUtils.farmLocked(chainBlocks.cronos);

  //add VVS balance in LP pool
  sdk.util.sumSingleBalance(
    balances,
    "cronos:0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03",
    farmTvl["cronos:0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03"]
  );
  //add V3S balance in V3S-VVS LP pool
  sdk.util.sumSingleBalance(
    balances,
    "cronos:0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03",
    farmTvl["cronos:0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03"]
  );

  //add WCRO balance in LP pool
  sdk.util.sumSingleBalance(
    balances,
    "cronos:0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
    farmTvl["cronos:0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23"]
  );
  //add V3S, VSHARE balance in *-WCRO LP pool
  sdk.util.sumSingleBalance(
    balances,
    "cronos:0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
    farmTvl["cronos:0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23"]
  );
  return balances;
}

module.exports = {
  cronos: {
    tvl: tvl,
    pool2: pool2,
    staking: stakingUnknownPricedLP(
      boardroom,
      vshare,
      "cronos",
      "0xcb0704bc4e885384ac96f0ed22b9204c3add91ad"
    )
  },
};
