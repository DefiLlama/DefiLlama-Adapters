const abi = require("../helper/abis/masterchef.json")
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0x295cf2cC1e7236753EE6b280C066FcE5B22601be"
const mymine = "0x3d3121D2aeDff5e11E390027331CB544Bc3D2C59"
const mymineFtmLP = "0xeBe2b687ABAc62b2f0f2414b8345d907FBfFA83a";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [mymine, mymineFtmLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
      tvl,
      staking: staking(chef, mymine, "fantom"),
      pool2: pool2Exports(chef, [mymineFtmLP], "fantom"),
  },
  
} 