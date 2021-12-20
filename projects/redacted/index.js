const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

const treasuries = ["0xa52fd396891e7a74b641a2cb1a6999fcf56b077e", "0x086c98855df3c78c6b481b6e1d47bef42e9ac36b"]

async function tvl(time, block){
    const balances = {}
    await sumTokensAndLPsSharedOwners(balances, [
        //(1) CVX
        ["0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b", false],
        //(1) CRV
        ["0xD533a949740bb3306d119CC777fa900bA034cd52", false],
        //(1) Sushi LP
        ["0xe9ab8038ee6dd4fcc7612997fe28d4e22019c4b4", true],
        //(2) OHM 
        ["0x383518188c0c6d7730d91b2c03a03c837814a899", false],
        //(2) CVX * 0.001 cvx balance
        ["0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b", false],
    ], treasuries, block)
    return balances
}

module.exports = {
    timetravel: true,
    methodology: "tvl = treasury",
    ethereum:{
        staking: staking("0xbde4dfb0dbb0dd8833efb6c5bd0ce048c852c487", "0xc0d4ceb216b3ba9c3701b291766fdcba977cec3a"),
        tvl
    },
}