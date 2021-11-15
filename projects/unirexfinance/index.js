const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0x75417a5647b88dc50f341cbed5db9ad6c3027ed5"
const funirex = "0x350a911687eb9710f1d36792f26d419577b127a8"
const funirexFtmLP = "0x4ff57fafa10d375aac73e3bddd30f4ceaea1554f"
const funirexUsdcLP = "0xed16cf3f8b5f05a3bc26fed6ba8b650fef2246ce";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [funirex, funirexFtmLP, funirexUsdcLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      tvl,
      staking: staking(chef, funirex, "fantom"),
      pool2: pool2Exports(chef, [funirexFtmLP, funirexUsdcLP], "fantom"),
  },
  
} 