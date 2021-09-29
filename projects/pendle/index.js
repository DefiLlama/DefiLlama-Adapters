const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs')
const contracts = require('./contracts')

const tokens = contracts.tokens;
const fundedContracts = Object.keys(contracts.funded);
const stakingContracts = Object.keys(contracts.staking);
const otTokens = Object.keys(contracts.otTokens);
const pool2Contracts = Object.keys(contracts.pool2);

async function tvl(timestamp, block) {
    const balances = {}

    await sumTokensAndLPsSharedOwners(balances, [
        [tokens["USDC"], false],
        [tokens["aUSDC"], false],
        [tokens["cDAI"], false],
        [tokens["SLP_ETHUSDC"], true],
        [tokens["SLP_PENDLEETH"], true],
        [tokens["SUSHI"], false],
        [tokens["COMP"], false]
    ], fundedContracts, block)
    delete balances[tokens["PENDLE"]]
    return balances
}
async function staking(timestamp, block) {
    const staking = {}
    await sumTokensAndLPsSharedOwners(staking, [
        [tokens["USDC"], false],
        [tokens["PENDLE"], false],
        [tokens["SLP_OT_aUSDC_21"], true],
        [tokens["SLP_OT_aUSDC_22"], true],
        [tokens["SLP_OT_cDAI_21"], true], 
        [tokens["SLP_OT_cDAI_22"], true],
        [tokens["SLP_OT_ETHUSDC_22"], true],
        [tokens["SLP_OT_PEP_22"], true]
    ], stakingContracts, block)
    for (token of otTokens) {
        delete staking[token.toLowerCase()]
    }
    return staking
}
async function pool2(timestamp, block) {
    const pool2 = {}
    await sumTokensAndLPsSharedOwners(pool2, [
        [tokens["SLP_PENDLEETH"], true],
        [tokens["PENDLE"], false],
        [tokens["SUSHI"], false]
    ], pool2Contracts, block)

    return pool2
}
// node test.js projects/pendle/index.js
module.exports = {
    tvl,
    staking:{
        tvl: staking
    },
    pool2:{
        tvl: pool2
    },
    methodology: "Counts the collateral backing the yield tokens and USDC in the pendle markets. Staking TVL is just staked PENDLE on 0x07282F2CEEbD7a65451Fcd268b364300D9e6D7f5. Pool2 refers to the Pe,P pool at 0x685d32f394a5F03e78a1A0F6A91B4E2bf6F52cfE",
}
