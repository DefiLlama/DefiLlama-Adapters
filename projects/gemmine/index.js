const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0xf3C01F6D7ec85682FCAAfE438B8C6A3a54C7164C"
const gemmine = "0x1e2a499fAefb88B2d085d7036f3f7895542b09De"
const gemmineFtmLP = "0xBc2c0E34BF4955eB8967504d0f873b40D1d75Ef9";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [gemmine, gemmineFtmLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      tvl,
      staking: staking(chef, gemmine, "fantom"),
      pool2: pool2Exports(chef, [gemmineFtmLP], "fantom"),
  },
  
} 