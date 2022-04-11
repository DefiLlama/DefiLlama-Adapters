const { stakingPricedLP } = require("../helper/staking");
const { sumTokensSharedOwners } = require("../helper/unwrapLPs");
const { pool2 } = require("../helper/pool2");
const { handleYearnTokens } = require("./helper.js");

const lending = "0x04D2C91A8BDf61b11A526ABea2e2d8d778d4A534"

async function tvl(time, ethBlock, chainBlocks){
    const chain = 'fantom'
    const block = chainBlocks[chain]
    const balances = {}
    const transform = addr=> addr==="0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e"?"0x6b175474e89094c44da98b954eedeac495271d0f":`${chain}:${addr}`
    await sumTokensSharedOwners(balances, [
        "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
        "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
        "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e",
        "0x321162Cd933E2Be498Cd2267a90534A804051b11",
        "0x74b23882a30290451A17c44f4F05243b6b58C76d"
    ], [lending], block, chain, transform)
    await handleYearnTokens(balances, [
        "0x637ec617c86d24e421328e6caea1d92114892439",
        "0xef0210eb96c7eb36af8ed1c20306462764935607",
        "0x0dec85e74a92c52b7f708c4b10207d9560cefaf0"
    ], lending, block, chain, transform)
    return balances
}

module.exports={
    fantom:{
        tvl,
        staking: stakingPricedLP("0xd9e28749e80D867d5d14217416BFf0e668C10645", "0x77128dfdd0ac859b33f44050c6fa272f34872b5e", "fantom", "0x06F3Cb227781A836feFAEa7E686Bdc857e80eAa7", "wrapped-fantom"),
        pool2: pool2("0xe0c43105235c1f18ea15fdb60bb6d54814299938", "0x06f3cb227781a836fefaea7e686bdc857e80eaa7", "fantom"),
    },
}