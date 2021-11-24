const { staking } = require("../helper/staking");
const sdk = require('@defillama/sdk')

const stakingAddresses = [
    "0x1d37f1e6f0cce814f367d2765ebad5448e59b91b",
    "0x1aBd0067f60513F152ff14E9cD26a62c820d022C"
]
const idia = "0x0b15ddf19d47e6a86a56148fb4afffc6929bcb89"

module.exports={
    bsc:{
        tvl:()=>({}),
        staking: sdk.util.sumChainTvls(stakingAddresses.map(a=>staking(a, idia, "bsc")))
    }
}