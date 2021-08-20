const sdk = require('@defillama/sdk');
const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs')

const aUSDC = "0xbcca60bb61934080951369a648fb03df4f96263c"
const cDAI = "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643"
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
const SUSHI = "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2"
const COMP = "0xc00e94Cb662C3520282E6f5717214004A7f26888"
const PENDLE = "0x808507121b80c02388fad14726482e061b8da827"

const contracts = Object.keys({
    "0x33d3071cfa7404a406edB5826A11620282021745": "PendleAaveV2YieldTokenHolder",
    "0xb0aa68d8A0D56ae7276AB9E0E017965a67320c60": "PendleCompoundYieldTokenHolder",
    "0xa06634BE609153b77355BFD09F9d59345939C59b": "PendleSushiswapComplexYieldTokenHolder",

    "0x9e382E5f78B06631E4109b5d48151f2b3f326df0": "PendleAaveUSDCDec21Market",
    "0x8315BcBC2c5C1Ef09B71731ab3827b0808A2D6bD": "PendleAaveUSDCDec22Market",
    "0x944d1727d0b656f497e74044ff589871c330334f": "PendleCompoundDAIDec21Market",
    "0xB26C86330FC7F97533051F2F8cD0a90C2E82b5EE": "PendleCompoundDAIDec22Market",
    "0x79c05Da47dC20ff9376B2f7DbF8ae0c994C3A0D0": "PendleSLP-ETHUSDC/USDC22Market",

    "0x3483194Ac09097463CB426D8c0fc31c1476212f9": "PendleLpHolder_AaveUSDCDec21",
    "0x76A16d9325E9519Ef1819A4e7d16B168956f325F": "PendleLpHolder_AaveUSDCDec22",
    "0x5444070C9252BC6162A78fcFf66CF8Dcc3e729B8": "PendleLpHolder_CompoundDAIDec21",
    "0x2F16B22C839FA995375602562ba5dD15A22d349d": "PendleLpHolder_CompoundDAIDec22",
    "0xb69DA28b6B5DdF0fd4Fee4823A3Ffd2243A13C92": "PendleLpHolder_SLP-ETHUSDC/USDC22"
})

const SingleStaking = "0x07282F2CEEbD7a65451Fcd268b364300D9e6D7f5"

const pool2contracts = Object.keys({
    "0x685d32f394a5F03e78a1A0F6A91B4E2bf6F52cfE": "PendleSLP-PENDLEETH/PENDLE22Market",
    "0xab30397316d06572968d068d16f1e611c46474e2": "PendleLpHolder_SLP-PENDLEETH/PENDLE22",
    "0xbFD6b497dCa3e5D1fA4BbD52996d400980C29Eb7": "PendleSushiswapComplexYieldTokenHolder"
})

async function tvl(timestamp, block) {
    const balances = {}
    await sumTokensAndLPsSharedOwners(balances, [
        [aUSDC, false],
        [cDAI, false],
        [USDC, false],
        [SUSHI, false],
        [COMP, false],
    ], contracts, block)

    return balances
}

async function pool2(timestamp, block) {
    const pool2 = {}
    await sumTokensAndLPsSharedOwners(pool2, [
        [PENDLE, false],
        [SUSHI, false],
    ], pool2contracts, block)

    return pool2
}

async function staking(timestamp, block) {
    return {
        [PENDLE]: (await sdk.api.erc20.balanceOf({
            target: PENDLE,
            owner: SingleStaking,
            block
        })).output
    }
}

module.exports = {
    tvl,
    staking:{
        tvl: staking
    },
    pool2:{
        tvl: pool2
    },
    methodology: "Counts USDC and DAI earning yield on Compound/Aave and backing the yield tokens and USDC in the pendle markets. Staking TVL is just staked PENDLE on 0x07282F2CEEbD7a65451Fcd268b364300D9e6D7f5. Pool2 refers to the Pe,P pool at 0x685d32f394a5F03e78a1A0F6A91B4E2bf6F52cfE",
}
