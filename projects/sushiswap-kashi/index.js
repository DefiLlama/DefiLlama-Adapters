const {kashiLending, kashiLendingFantom} = require('./kashi-lending.js')

const modulesToExport = {}
const kashi_chains = ['ethereum', //'polygon', 
    'bsc', 'fantom', //'xdai', 
    'arbitrum']
    
kashi_chains.forEach(chain => {
    modulesToExport[chain]={
        tvl: kashiLending(chain, false),
        borrowed: kashiLending(chain, true),
    }
})
// Fantom: use a more precise method correctly unwrapping wrapped assets
modulesToExport['fantom'].tvl = kashiLendingFantom

module.exports = {
    misrepresentedTokens: true,
    ...modulesToExport,
}