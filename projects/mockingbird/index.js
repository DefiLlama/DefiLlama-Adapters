const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0x7a7d80c024192E946C8931CcD325ECb2F42f8361"
const mockingbird = "0x0A737c40E42b164B30c0d3E5A19152CB89aA3EB9"
const mockingbirdFtmLP = "0x04701bEef0caf3B623B3965323Ce3caa4B2b2d7D";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [mockingbird, mockingbirdFtmLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      tvl,
      staking: staking(chef, mockingbird, "fantom"),
      pool2: pool2Exports(chef, [mockingbirdFtmLP], "fantom"),
  },
  
} 