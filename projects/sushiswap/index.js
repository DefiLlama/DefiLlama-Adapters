const {staking} = require('../helper/staking')
const modulesToExport = require('./api')

const xSUSHI = "0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272"
const SUSHI = "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2"

modulesToExport.ethereum.staking = staking(xSUSHI, SUSHI, 'ethereum')
module.exports = {
    misrepresentedTokens: true,
    ...modulesToExport,
}
// node test.js projects/sushiswap/index.js