const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking, stakingPricedLP } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0x1277dd1dCbe60d597aAcA80738e1dE6cB95dCB54"
const vive = "0xE509Db88B3c26D45f1fFf45b48E7c36A8399B45A"
const viveFtmLP = "0xf561C4dA5c86F5B35E761E637aA6387219780bfA"
const viveUsdcLP = "0x2D2Ce3AD0Bf68624c8C80F26e0863214af284218";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [vive, viveFtmLP, viveUsdcLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      tvl,
      staking: stakingPricedLP(chef, vive, "fantom","0xf561C4dA5c86F5B35E761E637aA6387219780bfA", "fantom"),
      pool2: pool2Exports(chef, [viveFtmLP, viveUsdcLP], "fantom"),
  },
  
} 