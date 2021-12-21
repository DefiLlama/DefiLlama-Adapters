const sdk = require('@defillama/sdk')
const { getBlock } = require('../helper/getBlock')
const { sumTokensSharedOwners } = require('../helper/unwrapLPs')
const getPoolTokensAbi = require('./abi.json')

const vault = "0xad68ea482860cd7077a5D0684313dD3a9BC70fbB"
const event = "Swap(bytes32,address,address,uint256,uint256)"//"PoolRegistered(bytes32,address,uint8)"

async function tvl(timestamp, ethBlock, chainBlocks){
    const chain = "avax"
    const block = await getBlock(timestamp, chain, chainBlocks)
    const pools = await sdk.api.util.getLogs({
        target: vault,
        topic: event,
        keys: [],
        fromBlock: 8169253-1, // Change if different project/deployment
        toBlock: block,
        chain
    })
    const poolIds = pools.output.map(o=>o.topics[1])
    const poolTokens = await sdk.api.abi.multiCall({
        abi: getPoolTokensAbi,
        block, chain,
        calls: poolIds.map(id=>({
            target: vault,
            params: [id]
        }))
    })
    const tokens = new Set()
    poolTokens.output.forEach(call=>call.output.tokens.forEach(t=>tokens.add(t)))
    const balances = {}
    await sumTokensSharedOwners(balances, Array.from(tokens), [vault], block, chain, addr=>`${chain}:${addr}`)
    return balances
}

module.exports={
    avalanche:{
        tvl
    }
}