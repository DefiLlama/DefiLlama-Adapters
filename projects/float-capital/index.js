const { sumTokens} = require('../helper/unwrapLPs')

const vault = "0xce5da4bebBA980BeC39da5b118750A47a23D4B85"

async function tvl(time, ethBlock, chainBlocks){
    const balances = {}
    await sumTokens(balances, [[
        "0x27f8d03b3a2196956ed754badc28d73be8830a6e", // amDAI
        vault
    ]], chainBlocks.polygon, "polygon", addr=>`polygon:${addr}`)
    return balances
}

module.exports={
    tvl,
    methodology: `Gets the tokens on ${vault}`
}