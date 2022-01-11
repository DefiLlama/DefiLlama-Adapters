const { staking } = require("../helper/staking");
const { sumTokensSharedOwners } = require("../helper/unwrapLPs");
const { pool2 } = require("../helper/pool2");

const lending = "0x04D2C91A8BDf61b11A526ABea2e2d8d778d4A534"

async function tvl(time, ethBlock, chainBlocks){
    const chain = 'fantom'
    const block = chainBlocks[chain]
    const balances = {}
    await sumTokensSharedOwners(balances, [
        "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
        "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
        "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e",
        "0x321162Cd933E2Be498Cd2267a90534A804051b11",
        "0x74b23882a30290451A17c44f4F05243b6b58C76d"
    ], [lending], block, chain, addr=>`${chain}:${addr}`)
    return balances
}

module.exports={
    fantom:{
        tvl,
        staking: staking("0xd9e28749e80D867d5d14217416BFf0e668C10645", "0x77128dfdd0ac859b33f44050c6fa272f34872b5e", "fantom"),
        pool2: pool2("0xe0c43105235c1f18ea15fdb60bb6d54814299938", "0x06f3cb227781a836fefaea7e686bdc857e80eaa7", "fantom"),
    }
}