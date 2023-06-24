const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking, stakingPricedLP } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const spadechef = "0x7c799Af459C86069FEa65ee8c0ff3c059cDC021D"
const spade = "0x300e170EC32d09A4AA312A21c6bEd1C001Dcd996"
const spadeFtmLP = "0xD24Eaf52b1cb0624D7eEBCFE40DE59F96d3bDb1b"
const spadeUsdcLP = "0x8080233587CE98d6CA094823aB77AE20dA5f35Ac";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, spadechef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [spade, spadeFtmLP, spadeUsdcLP], true, true, spade);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      tvl,
      staking: stakingPricedLP(spadechef, spade, "fantom", spadeFtmLP, "fantom"),
      pool2: pool2Exports(spadechef, [spadeFtmLP, spadeUsdcLP], "fantom"),
  },
  hallmarks: [
    [1647734400, "Rug Pull"]
  ]
} 

