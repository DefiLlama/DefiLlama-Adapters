const { sumTokensAndLPsSharedOwners} = require('../helper/unwrapLPs')

const vault = "0xaedcfcdd80573c2a312d15d6bb9d921a01e4fb0f"

async function tvl(time, block){
    const balances = {}
    await sumTokensAndLPsSharedOwners(balances, [
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", //usdc
        "0x8e870d67f660d95d5be530380d0ec0bd388289e1", //pax
        "0x0000000000085d4780B73119b644AE5ecd22b376", //tusd
    ].map(t=>[t, false]), [vault], block)
    return balances
}

module.exports={
    tvl,
    methodology: `Gets the tokens on ${vault}`
}