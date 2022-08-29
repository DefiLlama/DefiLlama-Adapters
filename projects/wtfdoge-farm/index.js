const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking, stakingPricedLP } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0x03b487A2Df5ddc6699C545eB1Da27D843663C8b8"
const waterfall = "0xeF7B2204B5c4DCe2b30600B89e1C11bb881f3564"
const waterfallDogLP = "0x62b44635A4AeBcA4D329AdD86BC34d00869eF4d2"
const waterfallUsdcLP = "0x52d8E261cfdc7E62e783611b0bB6a3064dF9FC05";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.dogechain, "dogechain", transformAddress, abi.poolInfo, [waterfall, waterfallDogLP, waterfallUsdcLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  dogechain: {
      tvl,
      staking: stakingPricedLP(chef, waterfall, "dogechain", "0x62b44635A4AeBcA4D329AdD86BC34d00869eF4d2", "wrapped-dogechain"),
      pool2: pool2Exports(chef, [waterfallDogLP, waterfallUsdcLP], "dogechain"),
  },
  
} 