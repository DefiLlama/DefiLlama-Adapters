const { addFundsInMasterChef } = require("../helper/masterchef");
const { unwrapLPsAuto } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");
const { pool2 } = require('../helper/pool2')


const chef = "0x7C36c64811219CF9B797C5D9b264d9E7cdade7a4"
const dmd = "0x90E892FED501ae00596448aECF998C88816e5C0F"
const dmdFtmLP = "0xF10F0EeB144Eb223DD8Ae7d5dd7f3327E63A3C94"

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = i => `fantom:${i}`;
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, undefined, [dmd, dmdFtmLP])
  await unwrapLPsAuto({ balances, block: chainBlocks.fantom, chain: 'fantom', transformAddress})
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom:{
    staking: staking(chef, dmd, "fantom"),
    pool2: pool2(chef, dmdFtmLP, "fantom"),
    tvl
  },
}