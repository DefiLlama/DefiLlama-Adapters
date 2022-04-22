const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0x70C460D876895e72D28ee3125Cac556dC98aD2E1"
const zeus = "0xa5b92ef6d735a2B8A90ADB13EA96d8C9b18613D0"
const zeusFtmLP = "0x921230059Fc5181F95619f1EACaf13Bd30cd0ddD";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [zeus, zeusFtmLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      tvl,
      staking: staking(chef, zeus, "fantom"),
      pool2: pool2Exports(chef, [zeusFtmLP], "fantom"),
  },
  
} 