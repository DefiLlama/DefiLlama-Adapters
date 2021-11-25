const { staking } = require("../helper/staking");
const sdk = require('@defillama/sdk')
const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

const stakingAddresses = [
    "0x1d37f1e6f0cce814f367d2765ebad5448e59b91b",
    "0x1aBd0067f60513F152ff14E9cD26a62c820d022C"
]
const idia = "0x0b15ddf19d47e6a86a56148fb4afffc6929bcb89"

module.exports={
    bsc:{
        tvl: calculateUsdUniTvl(
            //factory
            "0x918d7e714243F7d9d463C37e106235dCde294ffC", 
            "bsc", 
            "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", 
            [
                //IF
                "0xb0e1fc65c1a741b4662b813eb787d369b8614af1",
                //STAX
                "0x0da6ed8b13214ff28e9ca979dd37439e8a88f6c4"
            ], 
            "wbnb"),
        staking: sdk.util.sumChainTvls(stakingAddresses.map(a=>staking(a, idia, "bsc")))
    }
}