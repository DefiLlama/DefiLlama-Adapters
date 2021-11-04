const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0x89dcd1DC698Ad6A422ad505eFE66261A4320D8B5"
const bouje = "0x37F70aa9fEfc8971117BD53A1Ddc2372aa7Eec41"
const boujeFtmLP = "0x91af3c43b77217c1f9622BFC2Cd313e213332901"
const boujeUsdcLP = "0xacf6728c977E349440827375C73Ee23bCE4Db291";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [bouje, boujeFtmLP, boujeUsdcLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      tvl,
      staking: staking(chef, bouje, "fantom"),
      pool2: pool2Exports(chef, [boujeFtmLP, boujeUsdcLP], "fantom"),
  },
  tvl,
} 