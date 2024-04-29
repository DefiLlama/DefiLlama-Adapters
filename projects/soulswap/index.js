const ADDRESSES = require('../helper/coreAssets.json')
const { calculateUsdSoulTvl } = require('./helper/getUsdSoulTvl.js')
const { staking } = require('../helper/staking.js');
const { underworldLending } = require('./underworld-lending.js')

const factory_fantom = '0x1120e150dA9def6Fe930f4fEDeD18ef57c0CA7eF'
const farm_fantom = '0xb898226dE3c5ca980381fE85F2Bc10e35e00634c'
const soul_fantom = '0xe2fb177009ff39f52c0134e8007fa0e4baacbd07'
const wftm_fantom = ADDRESSES.fantom.WFTM
const rndm_fantom = '0x49ac072c793fb9523f0688a0d863aadfbfb5d475'
const usdc_fantom = ADDRESSES.fantom.USDC
const wbtc_fantom = '0x321162cd933e2be498cd2267a90534a804051b11'

const factory_avax = '0x5BB2a9984de4a69c05c996F7EF09597Ac8c9D63a'
const farm_avax = '0xB1e330401c920077Ddf157AbA5594238d36b54B1'
const soul_avax = '0x11d6DD25c1695764e64F439E32cc7746f3945543'
const wavax_avax = ADDRESSES.avax.WAVAX
const usdc_avax = ADDRESSES.avax.USDC
const wbtc_avax = ADDRESSES.avax.WBTC_e
const weth_avax = ADDRESSES.avax.WETH_e

const wl_fantom = [ usdc_fantom, soul_fantom, rndm_fantom, wbtc_fantom ]
const wl_avax = [ usdc_avax, soul_avax, wbtc_avax, weth_avax ]

module.exports = {
  fantom:{
    staking: staking(farm_fantom, soul_fantom),
    tvl: calculateUsdSoulTvl(factory_fantom, 'fantom', wftm_fantom, wl_fantom, 'fantom'),
    borrowed: underworldLending('fantom', true)
  },
  avax:{
    staking: staking(farm_avax, soul_avax),
    tvl: calculateUsdSoulTvl(factory_avax, 'avax', wavax_avax, wl_avax, 'avax'),
    borrowed: underworldLending('avax', true)
  },
  misrepresentedTokens: true,
  methodology: "Counts liquidity on the exchange, staked soul, and underworld assets.",
}
