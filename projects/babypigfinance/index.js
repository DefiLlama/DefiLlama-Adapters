const abi = require("./abi.json");
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2 } = require('../helper/pool2')


const chef = "0x7f8ECcC1437aaCEFE533A6f1BfE2144b1d0d7D35"
const fbabypig = "0x3a76b1b3e827cc7350e66a854eced871a81a3527"
const fbabypigFtmLP = "0xc56a420486f547a5adc1dd64b4a13051baa4a8e0"

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [fbabypig, fbabypigFtmLP])
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom:{
    staking: staking(chef, fbabypig, "fantom"),
    pool2: pool2(chef, fbabypigFtmLP, "fantom"),
    tvl
  },
}