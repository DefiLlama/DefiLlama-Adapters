const abi = require("./abi.json");
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0x30b65159dB82eFCf8CEde9861bc6B85336310EB2"
const meso = "0x4D9361A86D038C8adA3db2457608e2275B3E08d4"
const mesoFtmLP = "0x0Dd94754C2BC621Ef8De2fd7A9DF2BC5283e9479"

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [meso, mesoFtmLP])
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  staking:{
    tvl: staking(chef, meso, "fantom")
  },
  pool2: pool2Exports(chef, [mesoFtmLP], "fantom"),
  tvl,
}