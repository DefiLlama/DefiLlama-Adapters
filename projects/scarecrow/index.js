const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0xbCEf0849DDd928835A6Aa130aE527C2703CD832C"
const scare = "0x46e1Ee17f51c52661D04238F1700C547dE3B84A1"
const scareFtmLP = "0xd6b312d05fadba48ec6b899dd7db61e79fc36681"
const scareUsdcLP = "0xC4C9a74b10Ca90DbA51a4ec69c7b3CE6709bAebf";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [scare, scareFtmLP, scareUsdcLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      tvl,
      staking: staking(chef, scare, "fantom"),
      pool2: pool2Exports(chef, [scareFtmLP, scareUsdcLP], "fantom"),
  },
  
} 