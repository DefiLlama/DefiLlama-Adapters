const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const SimpleGToken = {
  era: "0x0729e806f57CE71dA4464c6B2d313E517f41560b",
  arbitrum: "0xAC29F414FB40BA4e29Ab8504a55cBfFD315D2430"
}
const Treasury = {
  era: "0x1fb8611064a09469F808263C398623A86e7Aa883",
  arbitrum: "0x15c80BbC0D05656002BD922BFbf46e185BCa5A9e"
}
const Staking = {
  arbitrum: "0x05027E21F6cEfb38970f4e0c04cD6DacA15aCBcE",
}

const CNG_ADDRESS = {
  ethereum: "0x5C1d9aA868a30795F92fAe903eDc9eFF269044bf",
  arbitrum: '0x4e7e5023656863E26f50E2E6E59489A852C212c1',
}

module.exports = {
  methodology: `Count the USDC that has been deposited on Gambit`,
  era: {
    tvl: sumTokensExport({ owners: [SimpleGToken.era, Treasury.era], tokens: [ADDRESSES.era.USDC], }),
  },
  arbitrum: {
    tvl: sumTokensExport({
      owners: [SimpleGToken.arbitrum, Treasury.arbitrum],
      tokens: [ADDRESSES.arbitrum.USDC_CIRCLE],
    }),
    staking: sumTokensExport({ owners: [Staking.arbitrum], tokens: [CNG_ADDRESS.arbitrum], }),
  },
};
