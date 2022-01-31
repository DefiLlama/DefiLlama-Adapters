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
  methodology: "TVL includes all farms in MasterChef contract, as well as staking pools.",
  fantom: {
    tvl,
    staking: stakings(["0x7A93C6dDEbc2089F6D5bcccF1025d6D0E31d4DA4", "0x47775F72E8bfa98dE4613db6cD4b5772aC4aBEC8", "0x5406566EDCD5B108212Bb69382a8869D761E738E", "0xdf3A3D03a92F54f8859355924f4581443B80C714", "0x7373E5b59bf20345b0D452f9a294A51429ca1F9b", "0x9bd3dACe24745Eb117c1F7f93AAEC5e37333c079", "0x7928de9d6DB88280DBa4613864a518A98F32D342", "0xaDb29fBBb9962Fe643676e2433114F0446923221", "0x60131EC5BE073F1c34A9b506ce30eA7aAC7eed15", "0x62CfcABA772e90F743990A8bcEDAC04AbBF7E75f", 
                       "0x7E01c21789DEF6572E31Ab6c67A4182E0808428B", "0x2D5F05D8e578397889f5F5C88d8e3b81D8a6f865", "0x578fb737cf5F3814Ddd80Cd6a7b4FFF9504c0c39", "0xb6bA5d27b00c2E62e32c0716D7c6505463cFBbf2", "0xb31bF9a835584d18595d886D35157467576A76e8", "0xde1592f643F9c77f186970daa43D3cAB22C0fd22", "0xeF5627d8B7BC8102E0C9760F62E0c5b0b7F38AF6", "0x80da05De8B759B7A9399F43C04A859cC0eaA24AC", "0x983A4dA9E8baC8b8F2F04B161968906B780f3629", "0x63AD93bAb2842Fefec06630b9ddC7A2351D7cb91"], "0xB66b5D38E183De42F21e92aBcAF3c712dd5d6286", "fantom")
  }
}
