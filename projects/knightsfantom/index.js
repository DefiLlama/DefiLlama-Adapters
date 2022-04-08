const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0x2166496575200E170310a34B5F697f7c124fF2C7"
const knights = "0xba36266B6565C96BD77815fa898f403Cc06F64cf"
const knightsFtmLP = "0x26ac59ee36965db597167c4a1b1b4367285aa4e3";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [knights, knightsFtmLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      tvl,
      staking: staking(chef, knights, "fantom"),
      pool2: pool2Exports(chef, [knightsFtmLP], "fantom"),
  },
  
} 