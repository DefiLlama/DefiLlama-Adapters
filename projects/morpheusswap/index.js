const abi = require("./abi.json");
const {calculateUsdUniTvl } = require("../helper/getUsdUniTvl");
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
  fantom:{
    tvl: calculateUsdUniTvl("0x9C454510848906FDDc846607E4baa27Ca999FBB6", "fantom", "0x82f0b8b456c1a451378467398982d4834b6829c1", [
      "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83"
    ], "magic-internet-money", 18, true),
    staking: staking(chef, morph, "fantom")
  }
}