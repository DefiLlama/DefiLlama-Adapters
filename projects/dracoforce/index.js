const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0x3D45191668dC53FFD60ea86F664716F4b320c372"
const draco = "0x8d05B42749428C26613deB12f8989Cb8D1f5c17f"
const dracoFtmLP = "0xe6d47e140385bbdb3aac60b87b5f51e0d6340871"
const dracoUsdcLP = "0x8562e3032753edf3edf5f4d11bc079b43c9b224c";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [draco, dracoFtmLP, dracoUsdcLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      tvl,
      staking: staking(chef, draco, "fantom"),
      pool2: pool2Exports(chef, [dracoFtmLP, dracoUsdcLP], "fantom"),
  },
  
} 