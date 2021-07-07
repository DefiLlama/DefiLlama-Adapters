const sdk = require('@defillama/sdk');
const { sumTokensAndLPs } = require('../helper/unwrapLPs')

const aUSDC = "0xbcca60bb61934080951369a648fb03df4f96263c"
const cDAI = "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643"
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
const PENDLE = "0x808507121b80c02388fad14726482e061b8da827"
// Pulled from https://github.com/pendle-finance/pendle-core/blob/master/docs/contracts_with_funds.json
const contracts = Object.keys({
    "0x33d3071cfa7404a406edB5826A11620282021745": "PendleCompoundYieldTokenHolder",
    "0xb0aa68d8A0D56ae7276AB9E0E017965a67320c60": "PendleAaveV2YieldTokenHolder",
    "0x8315BcBC2c5C1Ef09B71731ab3827b0808A2D6bD": "PendleAaveMarket",
    "0xB26C86330FC7F97533051F2F8cD0a90C2E82b5EE": "PendleCompoundMarket",
    "0x2F16B22C839FA995375602562ba5dD15A22d349d": "PendleLpHolder_Compound",
    "0x76A16d9325E9519Ef1819A4e7d16B168956f325F": "PendleLpHolder_Aave",
})
const SingleStaking = "0x07282F2CEEbD7a65451Fcd268b364300D9e6D7f5"

// Treasury TVL consists of DAI balance + Sushi SLP balance
async function tvl(timestamp, block) {
    const balances = {}
    await sumTokensAndLPs(balances, [
        [aUSDC, false],
        [cDAI, false],
        [USDC, false],
    ], contracts, block)

    return balances
}

async function staking(timestamp, block) {
    return {
        [PENDLE]: await sdk.api.erc20.balanceOf({
            target: PENDLE,
            owner: SingleStaking,
            block
        })
    }
}

module.exports = {
    methodology: "Counts USDC and DAI earning yield on Compound/Aave and backing the yield tokens and USDC in the pendle markets. Staking TVL is just staked PENDLE on SingleStaking",
    tvl,
    staking:{
        tvl: staking
    }
}
