const sdk = require('@defillama/sdk')
const {sumTokens} = require('../helper/unwrapLPs')

const usdt = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
const USDTPlatform = '0xe0437BeB5bb7Cf980e90983f6029033d710bd1da'
const ETHPlatform = "0x5005e8Dc0033E78AF80cfc8d10f5163f2FcF0E79"
async function eth(_timestamp, ethBlock){
    return {
        [usdt]: (await sdk.api.erc20.balanceOf({
            target: usdt,
            owner: USDTPlatform,
            block: ethBlock
        })).output,
        [weth]: (await sdk.api.eth.getBalance({
            target: ETHPlatform,
            block: ethBlock
        })).output
    }
}


const usdtPolygon = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"
const usdtPlatPolygon = "0x88D01eF3a4D586D5e4ce30357ec57B073D45ff9d"
const usdcPolygon = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
const usdcPlatPolygon = "0x3863D0C9b7552cD0d0dE99fe9f08a32fED6ab72f"
async function polygon(_timestamp, ethBlock, chainBlocks){
    const balances = {}
    await sumTokens(balances, [[usdtPolygon, usdtPlatPolygon], [usdcPolygon, usdcPlatPolygon]], chainBlocks.polygon, 'polygon', addr=>`polygon:${addr}`)
    return balances
}

module.exports = {
    ethereum:{
        tvl: eth
    },
    polygon:{
        tvl: polygon
    },
    tvl: sdk.util.sumChainTvls([eth, polygon])
}