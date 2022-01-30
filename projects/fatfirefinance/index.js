<<<<<<< HEAD:projects/fatfirefinance/index.js
const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking, stakingPricedLP } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0xf908ed281f008eE3FcEaCfF2FdfbC2dADf213811"
const fatfire = "0xa5ee311609665Eaccdbef3BE07e1223D9dBe51de"
const fatfireFtmLP = "0x7023f01e237505423e65c0cebc6493232659ff14"
const fatfireUsdcLP = "0xf7aacebcD7DcaC4B723292cabAE08f10ddb4e704";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [fatfire, fatfireFtmLP, fatfireUsdcLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      tvl,
      staking: stakingPricedLP(chef, fatfire, "fantom", "0x7023f01e237505423e65c0cebc6493232659ff14", "wrapped-fantom"),
      pool2: pool2Exports(chef, [fatfireFtmLP, fatfireUsdcLP], "fantom"),
  },
  
} 
=======
const { masterChefExports } = require("../helper/masterchef");

const chef = "0xf908ed281f008eE3FcEaCfF2FdfbC2dADf213811"
const fatfire = "0xa5ee311609665Eaccdbef3BE07e1223D9dBe51de"

module.exports = {
  ...masterChefExports(chef, "fantom", fatfire, false),
}
>>>>>>> a5a597a63d723829d755e201100c2c446303450b:projects/fatfire/index.js
