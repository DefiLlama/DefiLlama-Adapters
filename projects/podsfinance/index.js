const sdk = require('@defillama/sdk')
const abi = require('./abi.json')

const registry = "0x8bf2ae0c5fd85ac69b25a22f4a58d528414f03ad"
const usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
async function tvl(time, block){
    const options = (await sdk.api.util.getLogs({
        target: '0x43fF98EB7Ec681A7DBF7e2b2C3589E79d5ce11E3',
        topic: 'OptionCreated(address,address,uint8,uint8,address,address,uint256,uint256,uint256)',
        fromBlock: 13221475,
        keys:[],
        toBlock: block,
    })).output.map(ev=>'0x'+ev.data.substr(26, 40))
    const ammPools = (await sdk.api.abi.multiCall({
        abi: abi.getPool,
        block,
        calls: options.map(o=>({
            target: registry,
            params: [o]
        }))
    })).output.map(o=>o.output)
    const balanceOfs = await sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        block,
        calls: options.concat(ammPools).map(o=>({
            target: usdc,
            params: [o]
        }))
    })
    const balances = {}
    sdk.util.sumMultiBalanceOf(balances, balanceOfs)
    return balances
}

module.exports={
    ethereum:{
        tvl
    }
}