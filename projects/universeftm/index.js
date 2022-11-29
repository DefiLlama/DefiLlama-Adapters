const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking, stakingPricedLP } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0x5b996C1F5bc7Ba09fB8d69FBB1c495f0a9D6b7D9"
const universe = "0xf346362004540F714a45c6E80c719767e087a649"
const universeFtmLP = "0xa86d64f6f1e23f36f2237b5e7012a46b62188529"
const universeUsdcLP = "0xf6d442bcb58bedb27fa128405ff808951d3111dc";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [universe, universeFtmLP, universeUsdcLP],true,true,universe);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      tvl,
      staking: stakingPricedLP(chef, universe, "fantom",universeFtmLP, "fantom"),
      pool2: pool2Exports(chef, [universeFtmLP, universeUsdcLP], "fantom"),
  },

} // node test.js projects/universeftm/index.js