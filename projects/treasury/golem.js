const { nullAddress, treasuryExports } = require("../helper/treasury");
const { mergeExports, getStakedEthTVL } = require('../helper/utils');

// Golem Network (Golem Factory).
const treasury = "0x7da82c7ab4771ff031b66538d2fb9b0b047f6cf9";
const GLM = "0x7dd9c5cba05e151c895fde1cf355c9a1d5da6429";

// withdrawal addresses of the Factory's validators, https://blog.golem.network/eth-staking-tests-summary/
const withdrawalAddresses = [
  '0x4297cc867B85B63297c34af4268ced9CaFC66F5a',
  '0x485aD74f70eA3ad814D1dfE7A9284085499DE682',
  '0x3dD89506d79f53DaD1B252fb9301Bc95C9792354',
  '0xFC6E18E22Ad11592494B3D541bA25Af63A807527',
]

module.exports = mergeExports([
  treasuryExports({
    ethereum: {
      tokens: [nullAddress],
      owners: [treasury, '0xFC6E18E22Ad11592494B3D541bA25Af63A807527'],
      ownTokens: [GLM],
    },
  }),
  { ethereum: { tvl: getStakedEthTVL({ withdrawalAddresses, proxy: true }) } },
])

module.exports.methodology = "ETH and GLM held by the Golem Factory treasury, plus the ETH staked in its validators (withdrawal addresses from https://blog.golem.network/eth-staking-tests-summary/)."
