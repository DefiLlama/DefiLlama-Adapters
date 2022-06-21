const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking, stakingPricedLP } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0x138c4dB5D4Ab76556769e4ea09Bce1D452c2996F"
const xpast = "0xD3111Fb8BDf936B11fFC9eba3b597BeA21e72724"
const xpastFtmLP = "0x9665067DceF6a88d2dCf042ee25A2d98a2DDF8D6"
const xpastUsdcLP = "0x73B019D2B6fD28D85eeAD4E85909d69Cc0472D5F";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [xpast, xpastFtmLP, xpastUsdcLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      tvl,
      staking: stakingPricedLP(chef, xpast, "fantom","0x9665067DceF6a88d2dCf042ee25A2d98a2DDF8D6", "fantom"),
      pool2: pool2Exports(chef, [xpastFtmLP, xpastUsdcLP], "fantom"),
  },
  
} 