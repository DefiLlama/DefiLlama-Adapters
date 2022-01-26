const sdk = require("@defillama/sdk")
const {getExports} = require('../helper/heroku-api')
const {staking} = require('../helper/staking')

const chains = ['polygon', 'celo', 'moonriver', 'bsc', 'avax', 'xdai', 'ethereum', 'heco', 'okexchain', 'palm', 'arbitrum', 'fantom', 'harmony', 'telos', 'fuse']

const xSUSHI = "0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272"
const SUSHI = "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2"

const modulesToExport = getExports("sushi", chains)
modulesToExport.ethereum.staking = staking(xSUSHI, SUSHI, 'ethereum')

<<<<<<< HEAD
// Add Kashi Lending TVL and Borrows 
const {kashiLending} = require('./kashi-lending.js')
const kashi_chains = ['ethereum', 'polygon', 'bsc', 'fantom', 'xdai', 'arbitrum']
kashi_chains.forEach(chain => {
    modulesToExport[chain].tvl = sdk.util.sumChainTvls([modulesToExport[chain].tvl, kashiLending(chain, false)])
    modulesToExport[chain].borrowed = kashiLending(chain, true) 
})
=======
// Add Kashi Lending to ethereum TVL
const {kashiLending, kashiLendingFantom} = require('./kashi-lending.js')
modulesToExport.ethereum.tvl = sdk.util.sumChainTvls([modulesToExport.ethereum.tvl, kashiLending])
modulesToExport.fantom.tvl = sdk.util.sumChainTvls([modulesToExport.fantom.tvl, kashiLendingFantom])
>>>>>>> main
// modulesToExport.ethereum.tvl = async (timestamp, block, chainBlocks) => getExports("sushi", ['ethereum']).ethereum.tvl() + kashiLending(timestamp, block, chainBlocks)

module.exports = {
    timetravel: true,
    misrepresentedTokens: true,
    ...modulesToExport,
}
