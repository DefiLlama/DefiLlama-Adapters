const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0xF7711748bF74f2dDC261e745Ff43FdD8abfD1200"
const jetmine = "0x71BE8F5F245c1F5aa5727DFdB36aAD3C71a4c26b"
const jetmineFtmLP = "0x9f0121654bb430192CF2Fc2fc5B6673C97d5DFA3";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [jetmine, jetmineFtmLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      tvl,
      staking: staking(chef, jetmine, "fantom"),
      pool2: pool2Exports(chef, [jetmineFtmLP], "fantom"),
  },
  
} 