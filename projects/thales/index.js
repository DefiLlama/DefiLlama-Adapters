const sdk = require('@defillama/sdk')
const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')
const abi = require('./abi.json')
const { dodoPool2 } = require('../helper/pool2')

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
    ethereum:{
        tvl,
        staking: staking("0x883d651429b0829bc045a94f288f3b514021b8c1", "0x03e173ad8d1581a4802d3b532ace27a62c5b81dc"),
        pool2: dodoPool2("0x136829c258e31b3ab1975fe7d03d3870c3311651", "0x031816fd297228e4fd537c1789d51509247d0b43")
    }
}