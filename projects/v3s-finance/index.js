const { addFundsInMasterChef } = require("../helper/masterchef");
const { stakingUnknownPricedLP } = require("../helper/staking");
const farmUtils = require("./farm-utils");

const sdk = require("@defillama/sdk");
const v3s = "0xC7e99a2f064Cf86aF91Db252a9D8Bc16e6fE7427";
const vshare = "0xdcC261c03cD2f33eBea404318Cdc1D9f8b78e1AD";
const krx = "0xf0681bb7088ac68a62909929554aa22ad89a21fb";
const krx_usdc = "0x9504a7cEd300B2C79e64FC63f368fC27011Fe916";
const mshare_mmf = "0xc924da29d37f3b8C62c4c3e4e6958bF2b5ebF677";
const mshare =  "0xf8b9facb7b4410f5703eb29093302f2933d6e1aa";
const masterchefV3S = "0xEe38B8d70382c50cDD020785D0aC551d259Cec84";
const boardroom = "0x3F728308A0fb99a8cE4F3F4F87E4e67a38F66746";

const mmf = "0x97749c9B61F878a880DfE312d2594AE07AEd7656";
const usdc = "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59";

async function tvl(timestamp, block, chainBlocks) {
  let balances = {}

  //V3S Reward Pools
  await addFundsInMasterChef(
    balances,
    masterchefV3S,
    chainBlocks.cronos,
    "cronos",
    (addr) => `cronos:${addr}`,
    undefined,
    [krx, mshare, v3s],
    true,
    true,
    v3s
  );

  //get staking KRX token
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

  //get staking MShare token
  let mshareBalance = await stakingUnknownPricedLP(
    masterchefV3S,
    mshare,
    "cronos",
    mshare_mmf
  )(timestamp, block, chainBlocks);
  sdk.util.sumSingleBalance(
    balances,
    `cronos:${mmf}`,
    mshareBalance[`cronos:${mmf}`]
  );

  // v3s LP
  const farmTvl = await farmUtils.farmLocked(chainBlocks["cronos"]);

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

  //add USDC balance in V3S-USDC LP pool
  sdk.util.sumSingleBalance(
    balances,
    "cronos:0xc21223249CA28397B4B6541dfFaEcC539BfF0c59",
    farmTvl["cronos:0xc21223249CA28397B4B6541dfFaEcC539BfF0c59"]
  );
  //add V3S balance in V3S-USDC LP pool
  sdk.util.sumSingleBalance(
    balances,
    "cronos:0xc21223249CA28397B4B6541dfFaEcC539BfF0c59",
    farmTvl["cronos:0xc21223249CA28397B4B6541dfFaEcC539BfF0c59"]
  );

  //add USDT balance in V3S-USDT LP pool
  sdk.util.sumSingleBalance(
    balances,
    "cronos:0x66e428c3f67a68878562e79A0234c1F83c208770",
    farmTvl["cronos:0x66e428c3f67a68878562e79A0234c1F83c208770"]
  );
  //add V3S balance in V3S-USDT LP pool
  sdk.util.sumSingleBalance(
    balances,
    "cronos:0x66e428c3f67a68878562e79A0234c1F83c208770",
    farmTvl["cronos:0x66e428c3f67a68878562e79A0234c1F83c208770"]
  );

  //BoardRoom
  let boardroomBalance = await stakingUnknownPricedLP(
    boardroom,
    vshare,
    "cronos",
    "0xcb0704bc4e885384ac96f0ed22b9204c3add91ad"
  )(timestamp, block, chainBlocks);

  sdk.util.sumSingleBalance(
    balances,
    "cronos:0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
    boardroomBalance["cronos:0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23"]
  );

  return balances;
}



module.exports = {
  cronos: {
    tvl,
    boardroom: stakingUnknownPricedLP(
      boardroom,
      vshare,
      "cronos",
      "0xcb0704bc4e885384ac96f0ed22b9204c3add91ad"
    )
  },
};
