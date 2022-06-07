const sdk = require('@defillama/sdk')
const { default: BigNumber } = require('bignumber.js')

const factory = "0xa03492A9A663F04c51684A3c172FC9c4D7E02eDc"
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"

const toAddress = data=>`0x${data.slice(64 - 40 + 2, 64 + 2)}`

async function tvl(_time, block){
    const poolLogs = await sdk.api.util.getLogs({
        target: factory,
        topic: "AntePoolCreated(address,address)",
        keys: [],
        toBlock: block,
        fromBlock: 13234803-1 // deployment
    })
    const pools = poolLogs.output.map(log=>toAddress(log.data))
    const ethBalances = await sdk.api.eth.getBalances({
        targets: pools,
        block
    })
    return {
        [WETH]: ethBalances.output.reduce((total, pool)=>total.plus(pool.balance), BigNumber(0)).toFixed(0)
    }
}

module.exports={
    tvl
}