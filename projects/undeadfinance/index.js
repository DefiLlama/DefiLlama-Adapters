const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0x18E84FEe58980473f6bEf65391e35eDC08C72af8"
const undead = "0x89dD4d82F4aF70df521A76A4f0997b5Dc571917E"
const undeadFtmLP = "0xa09a118a370cf88204834495b07aba34c67552dd"
const undeadUsdcLP = "0xc756b9bcc8113ab78a15b4d2c923ca8e4992371e";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [undead, undeadFtmLP, undeadUsdcLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      tvl,
      staking: staking(chef, undead, "fantom"),
      pool2: pool2Exports(chef, [undeadFtmLP, undeadUsdcLP], "fantom"),
  },
  
} 