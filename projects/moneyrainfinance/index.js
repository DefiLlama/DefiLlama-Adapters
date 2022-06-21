const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0xa1E756016D27E22eCA181D2dC1f6Bb462BbA199E"
const moneyrain = "0x9ce66Ef13D88cb1bC567E47459841483c5d9457C"
const moneyrainFtmLP = "0x18c7a09c1e0eb4045a1bdafd1fd78c016c4a2d84"
const moneyrainUsdcLP = "0x8e9d1a921f91c1f0d33c881d34de8d40a472be23";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [moneyrain, moneyrainFtmLP, moneyrainUsdcLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      tvl,
      staking: staking(chef, moneyrain, "fantom"),
      pool2: pool2Exports(chef, [moneyrainFtmLP, moneyrainUsdcLP], "fantom"),
  },
  
} 