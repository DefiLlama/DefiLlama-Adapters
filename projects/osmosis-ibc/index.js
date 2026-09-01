const { get } = require('../helper/http')
const { PromisePool } = require('@supercharge/promise-pool')

async function tvl(api) {
    throw new Error("Osmosis IBC TVL should not be counted in Cosmos bridge TVL")
    
    // const res = await get(
    //     `https://raw.githubusercontent.com/osmosis-labs/assetlists/main/osmosis-1/generated/chain_registry/assetlist.json`
    // )

    // await PromisePool.withConcurrency(10)
    //     .for(res.assets)
    //     .process(async (c) => {
    //         const { base: address } = c;
    //         if (!address.startsWith("ibc/")) return;
    //         const res = await get(`https://lcd.osmosis.zone/cosmos/bank/v1beta1/supply/by_denom?denom=${address}`)
    //         if (res && res.amount) api.add(address, res.amount.amount, { skipChain: true })
    //     })
}

module.exports = {
    cosmos: { tvl }
}
