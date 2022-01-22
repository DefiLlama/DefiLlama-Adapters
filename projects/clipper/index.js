const { sumTokensAndLPsSharedOwners} = require('../helper/unwrapLPs')
const { transformPolygonAddress } = require('../helper/portedTokens');
const sdk = require('@defillama/sdk')

const pool = {
    eth: "0xe82906b6B1B04f631D126c974Af57a3A7B6a99d9",
    poly: "0xD01e3549160c62Acabc4D0EB89F67aAFA3de8EEd"
}
const weth= "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"

async function eth(time, block){
    const balances = {
        [weth]: (await sdk.api.eth.getBalance({target: pool.eth, block})).output
    }
    await sumTokensAndLPsSharedOwners(balances, [
        "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", //wbtc
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", //usdc
        "0x6b175474e89094c44da98b954eedeac495271d0f", //dai
        "0xdac17f958d2ee523a2206206994597c13d831ec7", //usdt
    ].map(t=>[t, false]), [pool.eth], block)
    return balances
}

async function poly(time, block, chainBlocks){
    const balances = {}
    const transform = await transformPolygonAddress()
    await sumTokensAndLPsSharedOwners(balances, [
        "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6", //wbtc
        "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270", //wmatic
        "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619", //weth
        "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", //usdc
        "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063", //dai
        "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", //usdt
    ].map(t=>[t, false]), [pool.poly], chainBlocks.polygon, 'polygon', transform)
    return balances
}

module.exports={
    ethereum: {
        tvl: eth
    },
    polygon: {
        tvl: poly
    },
    methodology: `Gets the tokens on ${pool.eth} and ${pool.poly}`
}