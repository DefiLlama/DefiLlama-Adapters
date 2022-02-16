<<<<<<< HEAD:projects/thedonfinance/index.js
const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking, stakingPricedLP } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0xa50aca2e1c94652ab842e64410bce53247ef88ac"
const thedon = "0x62e96896d417dd929a4966f2538631ad5af6cb46"
const thedonFtmLP = "0x7b4dcd189e215465f74e80449701fe027ec41827"
const thedonUsdcLP = "0xe6c69c083b48710476e97a2eeca70ce5b1511d1f";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [thedon, thedonFtmLP, thedonUsdcLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      tvl,
      staking: stakingPricedLP(chef, thedon, "fantom", "0x7b4dcd189e215465f74e80449701fe027ec41827", "wrapped-fantom"),
      pool2: pool2Exports(chef, [thedonFtmLP, thedonUsdcLP], "fantom"),
  },
  
} 
=======
const { masterChefExports } = require("../helper/masterchef");

const chef = "0xa50ACA2e1c94652Ab842E64410bCe53247eF88ac"
const thedon = "0x62E96896d417dD929A4966f2538631AD5AF6Cb46"

module.exports = {
  ...masterChefExports(chef, "fantom", thedon, false),
}
>>>>>>> a5a597a63d723829d755e201100c2c446303450b:projects/thedon/index.js
