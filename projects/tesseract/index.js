const sdk = require('@defillama/sdk')
const abi = require('./abi.json')

const vaults = [
    '0xEB02e1024cC16bCD28adE5A87D46257dc307E18C',
    '0xf5e364b9c07222cdec7d371c1422625593966c54',
    '0xDF53c53E553524d13Fea7a4170856eb8b9C8a6EF',
    '0x7Cd28e21a89325EB5b2395591E86374522396E77'
]

async function tvl(time, ethBlock, chainBlocks){
    const chain = 'polygon'
    const block = chainBlocks[chain]
    const calls =  vaults.map(v=>({target:v}))
    const tokens = await sdk.api.abi.multiCall({
        calls,
        block,
        chain,
        abi: abi.token
    })
    const amounts = await sdk.api.abi.multiCall({
        calls,
        block,
        chain,
        abi: abi.totalAssets
    })
    const balances = {}
    for(let i=0; i<tokens.output.length; i++){
        sdk.util.sumSingleBalance(balances, chain+':'+tokens.output[i].output, amounts.output[i].output)
    }
    return balances
}

module.exports={
    polygon:{
        tvl
    }
}