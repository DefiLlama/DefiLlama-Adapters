const abi = require("./abi.json");
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");

const chef = {
    "fantom":"0x106804d24E0B7AB997D4b7Ab5cD5d8923C22707F"
}
const token = {
    "fantom":"0x49894fcc07233957c35462cfc3418ef0cc26129f",
}
async function tvlFantom(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef["fantom"], chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [token["fantom"]])
  return balances;
}


module.exports = {
  methodology: "TVL includes Cave and Attic in MasterChef contract",
  fantom: {
    tvl: tvlFantom,
    staking: staking(chef["fantom"], token["fantom"], "fantom")
  },
  
}