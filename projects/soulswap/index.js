const { staking } = require('../helper/staking.js');
const { underworldLending } = require('./underworld-lending.js')
const { getUniTVL } = require('../helper/unknownTokens')

const abis = {
  "allPairs": "function allPairs(uint256) view returns (address)",
  "allPairsLength": "uint256:totalPairs"
}

const factory_fantom = '0x1120e150dA9def6Fe930f4fEDeD18ef57c0CA7eF'
const farm_fantom = '0xb898226dE3c5ca980381fE85F2Bc10e35e00634c'
const soul_fantom = '0xe2fb177009ff39f52c0134e8007fa0e4baacbd07'

const factory_avax = '0x5BB2a9984de4a69c05c996F7EF09597Ac8c9D63a'
const farm_avax = '0xB1e330401c920077Ddf157AbA5594238d36b54B1'
const soul_avax = '0x11d6DD25c1695764e64F439E32cc7746f3945543'

module.exports = {
  misrepresentedTokens: true,
  fantom:{
    staking: staking(farm_fantom, soul_fantom),
    tvl: getUniTVL({ factory: factory_fantom, useDefaultCoreAssets: true, abis, }),
    borrowed: underworldLending('fantom', true)
  },
  avax:{
    staking: staking(farm_avax, soul_avax),
    tvl: getUniTVL({ factory: factory_avax, useDefaultCoreAssets: true, abis, }),
    borrowed: underworldLending('avax', true)
  },
  methodology: "Counts liquidity on the exchange, staked soul, and underworld assets.",
}
