const sdk = require("@defillama/sdk")
const {getExports} = require('../helper/heroku-api')
const {staking} = require('../helper/staking')
const modulesToExport = require('./api')

const xSUSHI = "0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272"
const SUSHI = "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2"

modulesToExport.ethereum.staking = staking(xSUSHI, SUSHI, 'ethereum')

// Add Kashi Lending TVL and Borrows 
const {kashiLending, kashiLendingFantom} = require('./kashi-lending.js')
const kashi_chains = ['ethereum', //'polygon', 
    'bsc', 'fantom', //'xdai', 
    'arbitrum']
    
kashi_chains.forEach(chain => {
    modulesToExport[chain].tvl = sdk.util.sumChainTvls([modulesToExport[chain].tvl, kashiLending(chain, false)])
    modulesToExport[chain].borrowed = kashiLending(chain, true) 
})
// Fantom: use a more precise method correctly unwrapping wrapped assets
modulesToExport['fantom'].tvl = sdk.util.sumChainTvls([modulesToExport['fantom'].tvl, kashiLendingFantom])


module.exports = {
    misrepresentedTokens: true,
    ...modulesToExport,
}
// node test.js projects/sushiswap/index.js