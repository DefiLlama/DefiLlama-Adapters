const abi = require("./abi.json");
const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { stakings } = require("../helper/staking");
const sdk = require('@defillama/sdk')

const chef = "0xc7dad2e953Dc7b11474151134737A007049f576E"
const morph = "0x0789ff5ba37f72abc4d561d00648acadc897b32d"

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = addr=>`fantom:${addr}` //await transformFantomAddress();
  if(chainBlocks.fantom<21182441){ // Factory deployment block
    await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, abi.poolInfo, [morph])
  } else {
    const dexTvl = calculateUsdUniTvl("0x9C454510848906FDDc846607E4baa27Ca999FBB6", "fantom", "0x82f0b8b456c1a451378467398982d4834b6829c1", [
      "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83"
    ], "magic-internet-money", 18, true)
    return dexTvl(timestamp, block, chainBlocks);
  }
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
    tvl,
    staking: stakings(["0xb31bF9a835584d18595d886D35157467576A76e8", "0xde1592f643F9c77f186970daa43D3cAB22C0fd22"], "0xB66b5D38E183De42F21e92aBcAF3c712dd5d6286", "fantom")
  }
}