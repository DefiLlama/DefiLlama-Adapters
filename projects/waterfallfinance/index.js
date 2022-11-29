const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking, stakingPricedLP } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0x4Be7079064537867b40829119Be49Ee8CC76570e"
const waterfall = "0x6b2a7B82d3F7a6e1F5A5831aB40666Ec717645d5"
const waterfallFtmLP = "0xc4ec70361f57ba0ca0ac82319677fb95b9837a78"
const waterfallUsdcLP = "0x7080f230f42b3b76828ba6392b50433edc0909fa";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [waterfall, waterfallFtmLP, waterfallUsdcLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      tvl,
      staking: stakingPricedLP(chef, waterfall, "fantom", "0xc4Ec70361f57Ba0Ca0Ac82319677fB95B9837A78", "wrapped-fantom"),
      pool2: pool2Exports(chef, [waterfallFtmLP, waterfallUsdcLP], "fantom"),
  },
  
} 