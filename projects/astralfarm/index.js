const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking, stakingPricedLP } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0x13E5A680606aB4965d09B1997486C715dE225EBE"
const astral = "0xd95322C0D069B51a41ed2D94A39617C2ACbcE636"
const astralFtmLP = "0x93E7752e611B2cD808E546E7FdA5512a89A91d4D"

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [astral, astralFtmLP],true,true,astral);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      tvl,
      staking: stakingPricedLP(chef, astral, "fantom",astralFtmLP, "fantom"),
      pool2: pool2Exports(chef, [astralFtmLP], "fantom"),
  },

} // node test.js projects/astralfarm/index.js