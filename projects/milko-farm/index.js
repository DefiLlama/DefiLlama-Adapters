const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')

const milkochef = "0x5d0C5db1D750721Ed3b13a8436c17e035B44c3D0"
const milko = "0x3c786134228b363fb2984619D7560AB56363B2bD"
const milkoAdaLP = "0x6A8039bB36C4f7315b7Be7Db0467D1259d0f3dB4"
const milkoUsdcLP = "0xd0394c4AE0a3BC079dcCe6E971CBF2eA57dbC063";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, milkochef, chainBlocks.milkomeda, "milkomeda", transformAddress, abi.poolInfo, [milko, milkoAdaLP, milkoUsdcLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  milkomeda: {
      tvl,
      staking: staking(milkochef, milko, "milkomeda"),
      pool2: pool2Exports(milkochef, [milkoAdaLP, milkoUsdcLP], "milkomeda"),
  }, 
} 

