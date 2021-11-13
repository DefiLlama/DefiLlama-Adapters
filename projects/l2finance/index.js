const sdk = require('@defillama/sdk')
const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs')
const abi = require('./abi.json')

const rollupChain = "0xf86FD6735f88d5b6aa709B357AD5Be22CEDf1A05"
const registry = "0xfe81ab6930a30bdae731fe7b6c6abfbeafc014a8"

async function tvl(timestamp, block){
    const strategies = (await sdk.api.util.getLogs({
        target: registry,
        fromBlock: 12283733-1,
        toBlock: block,
        keys:[],
        topic:'StrategyRegistered(address,uint32)'
    })).output.map(s=>"0x"+s.data.slice(26, 66))
    const [syncBalances, tokens] = await Promise.all([abi.syncBalance,abi.supplyToken].map(abiMethod=>sdk.api.abi.multiCall({
        abi: abiMethod,
        block,
        calls: strategies.map(s=>({target:s}))
    })))
    const balances = {}
    syncBalances.output.forEach((bal, i)=>{
        sdk.util.sumSingleBalance(balances, tokens.output[i].output, bal.output)
    })
    await sumTokensAndLPsSharedOwners(balances, [
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", //usdc
        "0x6b175474e89094c44da98b954eedeac495271d0f", //dai
        "0x4fabb145d64652a948d72533023f6e7a623c7c53", //busd
        "0xdac17f958d2ee523a2206206994597c13d831ec7", //usdt
    ].map(t=>[t,false]), [rollupChain], block)
    return balances
}

module.exports={
    ethereum:{tvl}
}