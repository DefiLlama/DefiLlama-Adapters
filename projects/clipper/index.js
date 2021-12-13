const { sumTokensAndLPsSharedOwners} = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')

const pool = "0xe82906b6B1B04f631D126c974Af57a3A7B6a99d9"
const weth= "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
async function tvl(time, block){
    const balances = {
        [weth]: (await sdk.api.eth.getBalance({target: pool, block})).output
    }
    await sumTokensAndLPsSharedOwners(balances, [
        "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", //wbtc
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", //usdc
        "0x6b175474e89094c44da98b954eedeac495271d0f", //dai
        "0xdac17f958d2ee523a2206206994597c13d831ec7", //usdt
    ].map(t=>[t, false]), [pool], block)
    return balances
}

module.exports={
    tvl,
    methodology: `Gets the tokens on ${pool}`
}