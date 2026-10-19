const { getTridentTVL } = require('../helper/sushi-trident')

// AllBlue V3 (Trident-style pools) on Avalanche. Pools are deployed behind EIP173 proxies
// whose admin is this factory/master deployer.
const ALLBLUE_V3_FACTORY = '0xE749c1cA2EA4f930d1283ad780AdE28625037CeD'

module.exports = {
  methodology: 'TVL is the sum of the token balances held by every AllBlue V3 pool on Avalanche. Pools are enumerated on-chain from the AllBlue V3 factory (totalPoolsCount/getPoolAddress) and each pool reports its assets via getAssets.',
  avax: {
    tvl: getTridentTVL({ factory: ALLBLUE_V3_FACTORY }),
  },
}
