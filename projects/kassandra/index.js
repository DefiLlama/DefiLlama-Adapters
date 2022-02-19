const sdk = require('@defillama/sdk')
const {sumTokens} = require('../helper/unwrapLPs')
const abi = require('./abi.json')

const indexToken = "0x17C1037B17b221f2f3b53f85cebD817C941f6bC5"

async function tvl(time, ethBlock, chainBlocks){
    const chain = "avax"
    const block = chainBlocks[chain]
    const tokens = await sdk.api.abi.call({
        target: indexToken,
        chain,
        block,
        abi: abi.getCurrentTokens
    })
    const balances = {}
    await sumTokens(balances, 
        tokens.output.map(t=>[t, indexToken]),
        block,
        chain,
        addr=>`${chain}:${addr}`
    )
    return balances
}

module.exports={
    tvl
}