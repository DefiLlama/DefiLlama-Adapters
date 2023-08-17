const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const hauntchef = "0xe5483461a024524e0a76B935A56B8D161E3F0D82"
const haunt = "0x8bD04EE83a6076d1216237C8B91f7EeE3AccaB35"
const hauntFtmLP = "0xd366d2af991755c0bd4f18ec13a3169a3d8a027e"
const hauntUsdcLP = "0x95b70d9ed25ffe2560b8ab182ec71bc712f55c72";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, hauntchef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [haunt, hauntFtmLP, hauntUsdcLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  hallmarks: [
    [1646524800,"Rug Pull"]
  ],
  fantom: {
      tvl,
      staking: staking(hauntchef, haunt, "fantom"),
      pool2: pool2Exports(hauntchef, [hauntFtmLP, hauntUsdcLP], "fantom"),
  },
  
} 

