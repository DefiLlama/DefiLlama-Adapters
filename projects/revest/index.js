const { default: axios } = require("axios")
const {sumTokensAndLPsSharedOwners} = require("../helper/unwrapLPs")

const holder = "0xA81bd16Aa6F6B25e66965A2f842e9C806c0AA11F"

async function tvl(time, block){
    const tokens = await axios.get("https://defi-llama-feed.vercel.app/api/address")
    const balances = {}
    await sumTokensAndLPsSharedOwners(balances, tokens.data.body.map(t=>[t, false]), [holder], block)
    return balances
}

module.exports={
    ethereum:{
        tvl
    }
}