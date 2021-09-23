const sdk = require('@defillama/sdk')
const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs')
const abi = require('./abi.json')

const marketsManager = "0x5ed98Ebb66A929758C7Fe5Ac60c979aDF0F4040a"
const sUSD = "0x57ab1ec28d129707052df4df418d58a2d46d5f51"

async function tvl(_time, block){
    const markets = await sdk.api.abi.call({
        target: marketsManager,
        abi: abi.activeMarkets,
        block,
        params:[0, 1000]
    })
    const balances = {}
    await sumTokensAndLPsSharedOwners(balances, [[sUSD, false]], markets.output, block)
    return balances
}

module.exports={
    methodology: "sUSD locked on markets",
    tvl
}