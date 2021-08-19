const sdk = require('@defillama/sdk')
const abi = require('./abi.json')

const registry = "0x3228f22d98d81A859aCC9890c3874FfF864a8Bd4"
const vault_role = "0x0e2208c692f4f271957e6c9d7c9785b7c2c3a7e329d54eecdfaa3c5f48b0cd51"

async function tvl(timestamp, block) {
    const count = Number((await sdk.api.abi.call({
        target: registry,
        block, 
        params: [vault_role],
        abi: abi.getRoleMemberCount
    })).output)
    const vaults = await sdk.api.abi.multiCall({
        block,
        abi: abi.getRoleMember,
        calls: [...Array(count)].map((_, i) => ({
            target: registry,
            params: [vault_role, i],
        }))
    })
    const calls = vaults.output.map(v=>({
        target: v.output
    }))
    const [totals, token0, token1] = await Promise.all([abi.calculateTotals, abi.token0, abi.token1].map(abi=>sdk.api.abi.multiCall({
        block,
        abi,
        calls
    })))
    const balances = {}
    for(let i =0; i<count; i++){
        sdk.util.sumSingleBalance(balances, token0.output[i].output, totals.output[i].output[0])
        sdk.util.sumSingleBalance(balances, token1.output[i].output, totals.output[i].output[1])
    }
    return balances
}

module.exports={
    ethereum:{
        tvl
    },
    tvl
}