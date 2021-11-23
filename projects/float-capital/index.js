const { sumTokens} = require('../helper/unwrapLPs')

const vaults = ["0xce5da4bebBA980BeC39da5b118750A47a23D4B85", "0x595b1408C9c2BF121c7674E270Ca7aCc0bBf100C", "0x694c240e63CF60a2cD2d38d84D902744640AcCDA"]
const amDAI = "0x27f8d03b3a2196956ed754badc28d73be8830a6e"

async function tvl(time, ethBlock, chainBlocks){
    const balances = {}
    await sumTokens(balances, vaults.map(v=>[amDAI, v]), chainBlocks.polygon, "polygon", addr=>`polygon:${addr}`)
    return balances
}

module.exports={
    tvl,
    methodology: `Gets the tokens on markets`
}