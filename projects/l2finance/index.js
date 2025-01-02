const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const abi = require('./abi.json')
const { getLogs } = require('../helper/cache/getLogs')

const rollupChain = "0xf86FD6735f88d5b6aa709B357AD5Be22CEDf1A05"
const registry = "0xfe81ab6930a30bdae731fe7b6c6abfbeafc014a8"

async function tvl(api) {
    const strategies = (await getLogs({
        api,
        target: registry,
        fromBlock: 12283732,
        topic: 'StrategyRegistered(address,uint32)'
    })).map(s => "0x" + s.data.slice(26, 66)).filter(i => i !== '0x61fc4d40d313eb01483f537a6db2b29fb38aea8d')
    const [syncBalances, tokens] = await Promise.all([abi.syncBalance, abi.supplyToken].map(abiMethod => api.multiCall({ abi: abiMethod, calls: strategies })))
    api.addTokens(tokens, syncBalances)
    return sumTokens2({ api, owner: rollupChain, tokens: [
        ADDRESSES.ethereum.USDC, //usdc
        ADDRESSES.ethereum.DAI, //dai
        ADDRESSES.ethereum.BUSD, //busd
        ADDRESSES.ethereum.USDT, //usdt
    ]})
}

module.exports = {
    ethereum: { tvl }
}