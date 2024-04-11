const ADDRESSES = require('../helper/coreAssets.json')
const {staking} = require('../helper/staking')
const { getExports } = require('../helper/heroku-api')
const indexExports = require('./api')

const xSUSHI = "0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272"
const SUSHI = ADDRESSES.ethereum.SUSHI
// const chainKeys = Object.keys(indexExports).filter(chain => typeof indexExports[chain] === 'object' && indexExports[chain].tvl)

// // module.exports = {
// //   timetravel: false,
// //   misrepresentedTokens: true,
// //   ...getExports("sushiswap", chainKeys),
// // }

module.exports = indexExports
module.exports.misrepresentedTokens = true

module.exports.ethereum.staking = staking(xSUSHI, SUSHI)
// node test.js projects/sushiswap/index.js

module.exports.boba_avax.tvl = () => ({}) // boba avax is sunset