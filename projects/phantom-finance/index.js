const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const phantomchef = "0x9d2025065498728558f364651960976CC83F14B6"
const phantom = "0x6230a87901C2ca6b23247a9afC1f63A8ecb95B05"
const phantomFtmLP = "0xb9e2dfc5c04f0d58a68748915f791508765ef668"
const phantomUsdcLP = "0x0e5c18cdea0201b4cdab908238d5e06180d7969a";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, phantomchef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [phantom, phantomFtmLP, phantomUsdcLP]);
  return balances;
}

module.exports = {
  hallmarks: [
    [1646179200, "Rug Pull"]
  ],
  deadFrom: 1648765747,
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      tvl,
      staking: staking(phantomchef, phantom, "fantom"),
      pool2: pool2Exports(phantomchef, [phantomFtmLP, phantomUsdcLP], "fantom"),
  },
  
} 

