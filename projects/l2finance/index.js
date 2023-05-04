const { sumTokens2 } = require('../helper/unwrapLPs')
const abi = require('./abi.json')
const { getLogs } = require('../helper/cache/getLogs')

const rollupChain = "0xf86FD6735f88d5b6aa709B357AD5Be22CEDf1A05"
const registry = "0xfe81ab6930a30bdae731fe7b6c6abfbeafc014a8"

async function tvl(timestamp, block, _, { api }) {
    const strategies = (await getLogs({
        api,
        target: registry,
        fromBlock: 12283732,
        topic: 'StrategyRegistered(address,uint32)'
    })).map(s => "0x" + s.data.slice(26, 66)).filter(i => i !== '0x61fc4d40d313eb01483f537a6db2b29fb38aea8d')
    const [syncBalances, tokens] = await Promise.all([abi.syncBalance, abi.supplyToken].map(abiMethod => api.multiCall({ abi: abiMethod, calls: strategies })))
    api.addTokens(tokens, syncBalances)
    return sumTokens2({ api, owner: rollupChain, tokens: [
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", //usdc
        "0x6b175474e89094c44da98b954eedeac495271d0f", //dai
        "0x4fabb145d64652a948d72533023f6e7a623c7c53", //busd
        "0xdac17f958d2ee523a2206206994597c13d831ec7", //usdt
    ]})
}

module.exports = {
    ethereum: { tvl }
}