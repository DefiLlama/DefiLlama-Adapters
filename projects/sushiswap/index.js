const {getExports} = require('../helper/heroku-api')
const {staking} = require('../helper/staking')

const chains = ['polygon', 'celo', 'moonriver', 'bsc', 'avax', 'xdai', 'ethereum', 'heco', 'okexchain', 'palm', 'arbitrum', 'fantom', 'harmony']

const xSUSHI = "0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272"
const SUSHI = "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2"

const modulesToExport = getExports("sushi", chains)
modulesToExport.ethereum.staking = staking(xSUSHI, SUSHI, 'ethereum')

// const {kashiLending} = require('./kashi-lending.js')
// modulesToExport.ethereum.tvl = async (timestamp, block, chainBlocks) => getExports("sushi", ['ethereum']).ethereum.tvl + kashiLending(timestamp, block, chainBlocks)
// modulesToExport.ethereum.tvl = kashiLending.tvl
// modulesToExport.ethereum.tvl = sdk.util.sumChainTvls(getExports("sushi", ['ethereum']).ethereum.tvl, kashiLending)

module.exports = {
    misrepresentedTokens: true,
    ...modulesToExport,
}