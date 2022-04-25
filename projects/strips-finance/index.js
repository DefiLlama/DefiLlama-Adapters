const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl')

const FACTORIES = "0xc35dadb65012ec5796536bd9864ed8773abc74c4"

const NATIVE_TOKEN_WETH = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1"

const TOKENS = {
    WETH: NATIVE_TOKEN_WETH,
    STRP: "0x326c33FD1113c1F29B35B4407F3d6312a8518431",
    USDC: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    USDC_STRP: "0x01dE11cfD3A7261A954db411f02C86D8b826e5d2",
    
}

const FUNDING_MARKETS = {
    ftxBTC:  "0x0CfB5ccC02E42F6C485AE826de1C42B3C16eafa8",
    binanceBTC:  "0x594C8612562f7578c3d45bf022c3b7f2154f3a2E",
    aave:  "0x9D8Afe7e5093f56D7929ab8Fc1A3A912343E5Ccc",
    sofr:  "0x8C72Db65d82D34386e34980a99ab1EbAf322a64B",
    insurance:  "0x5D623170f81E485e43841881F07B69e968CFf55a",
}

const tvl = calculateUsdUniTvl(
    FACTORIES,
    "arbitrum",
    NATIVE_TOKEN_WETH,
    [
        ...Object.values(TOKENS),
        ...Object.values(FUNDING_MARKETS)
    ], "arbitrum")

module.exports = {
    timetravel: true,
    methodology: "Strips.Finance Tvl Calculation",
    arbitrum: { tvl }
}
