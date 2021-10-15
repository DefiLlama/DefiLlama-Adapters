const abi = require("./abi.json");
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0x7C36c64811219CF9B797C5D9b264d9E7cdade7a4"
const dmd = "0x90E892FED501ae00596448aECF998C88816e5C0F"
const dmdFtmLP = "0xF10F0EeB144Eb223DD8Ae7d5dd7f3327E63A3C94"

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [dmd, dmdFtmLP])
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  staking:{
    tvl: staking(chef, dmd, "fantom")
  },
  pool2: pool2Exports(chef, [dmdFtmLP], "fantom"),
  tvl,
}