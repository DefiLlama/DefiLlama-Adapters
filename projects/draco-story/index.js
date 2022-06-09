const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking, stakingPricedLP } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0xAedCc6E2710d2E47b1477A890C6D18f7943C0794"
const draco = "0x01D3569eEdD1Dd32A698CAB22386d0F110d6b548"
const dracoFtmLP = "0x4e2f2E1E070083EbCEeceC4cbE8ba37Ee8459450"
const dracoUsdcLP = "0x860f87CE904B2200a6a45F099FED18d4b299248e";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [draco, dracoFtmLP, dracoUsdcLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      tvl,
      staking: stakingPricedLP(chef, draco, "fantom", "0x4e2f2E1E070083EbCEeceC4cbE8ba37Ee8459450", "wrapped-fantom"),
      pool2: pool2Exports(chef, [dracoFtmLP, dracoUsdcLP], "fantom"),
  },
  
} 