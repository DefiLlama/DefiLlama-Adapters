const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0x04f9433A2CD21413Bc5641b84CaE0E40E86f9101"
const lavafall = "0x7A0Ac775d290A7a3016f153d757Fbc3c4De62488"
const lavafallFtmLP = "0xb58221b3c8eA491637e29f84D20bC95Bdd18D910"
const lavafallUsdcLP = "0x697B07a3c13D4fb23974ce56c353493AAF6bCaf1";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [lavafall, lavafallFtmLP, lavafallUsdcLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      tvl,
      staking: staking(chef, lavafall, "fantom"),
      pool2: pool2Exports(chef, [lavafallFtmLP, lavafallUsdcLP], "fantom"),
  },
  
} 