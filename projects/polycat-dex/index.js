const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')
const factory = "0x477Ce834Ae6b7aB003cCe4BC4d8697763FF456FA";
const tankchef = "0xfaBC099AD582072d26375F65d659A3792D1740fB";
const paw = "0xbc5b59ea1b6f8da8258615ee38d40e999ec5d74f";


module.exports = {
  misrepresentedTokens: true,
  methodology: "TVL are from the pools created by the factory and TVL in vaults",
  polygon: {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true }),
    staking: staking(tankchef, paw),
  }
}