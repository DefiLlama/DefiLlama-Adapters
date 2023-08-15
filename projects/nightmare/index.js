const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const fearchef = "0xcF9aeC9E5A7307285252B0F155E1Dc614704f4dD"
const fear = "0x465d67204A8F7c02cd35288Cc7712526359FB0a9"
const fearFtmLP = "0x2fd5ae787987c20545b18998cd2c6b6d87953ed3"
const fearUsdcLP = "0x69e22277cc54581410bd425058b272808a505f11";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, fearchef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [fear, fearFtmLP, fearUsdcLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  hallmarks: [
    [1646179200, "Rug Pull"]
  ],
  fantom: {
      tvl,
      staking: staking(fearchef, fear, "fantom"),
      pool2: pool2Exports(fearchef, [fearFtmLP, fearUsdcLP], "fantom"),
  },
  
} 