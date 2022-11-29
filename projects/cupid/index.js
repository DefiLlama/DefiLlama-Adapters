const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const cupidchef = "0xBCec0e5736614D8Bd05502A240526836bA0bBFc5"
const cupid = "0xD4C000c09bfeF49ABBd5c3728fcec3a42c68eBa1"
const cupidFtmLP = "0x5853da628f4655d7d80f80501ab6b6faa241e38b"
const cupidUsdcLP = "0xd30ce73f7294be94f9d76d308d5400f3483e369f";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, cupidchef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [cupid, cupidFtmLP, cupidUsdcLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      tvl,
      staking: staking(cupidchef, cupid, "fantom"),
      pool2: pool2Exports(cupidchef, [cupidFtmLP, cupidUsdcLP], "fantom"),
  },
  
} 