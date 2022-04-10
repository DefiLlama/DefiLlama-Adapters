const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const ntlychef = "0x1203Ea38AEece89CbE1bA527470303AFff116839"
const ntly = "0xc1260013FF1331cdA0Ef085afE84A5FD86EaDB00"
const ntlyFtmLP = "0xBb62153A8B32e4f16957208094B0548351A09f4C"
const ntlyUsdcLP = "0x592c41B32Ddb2d043d7F879744D0B0e217B25e6d";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, ntlychef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [ntly, ntlyFtmLP, ntlyUsdcLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      tvl,
      staking: staking(ntlychef, ntly, "fantom"),
      pool2: pool2Exports(ntlychef, [ntlyFtmLP, ntlyUsdcLP], "fantom"),
  }, 
} 

