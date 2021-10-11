const abi = require("./abi.json");
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");

const chef = "0xc7dad2e953Dc7b11474151134737A007049f576E"
const morph = "0x0789ff5ba37f72abc4d561d00648acadc897b32d"

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [morph])
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  staking:{
    tvl: staking(chef, morph, "fantom")
  },
  tvl,
}