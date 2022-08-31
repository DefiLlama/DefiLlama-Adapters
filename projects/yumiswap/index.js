const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl')
const { stakingUnknownPricedLP } = require("../helper/staking");

const FACTORIES = "0xD3CFB8A232Ad5D0A7ABc817ae3BD1F3E7AE4b5E0"
const YUMI_TOKEN_ADDRESS = "0x665F8B21878bDECa8bD94507120730a40dCd4F61";
const XYUMI_ADDRESS = "0xCc7a1Bd54375fa5bc408aC319569eCc81c8d4208";

const NATIVE_TOKEN_WASTR = "0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720"

const TOKENS = {
    WASTR: NATIVE_TOKEN_WASTR,
    WETH: "0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c",
    WBTC: "0xad543f18cFf85c77E140E3E5E3c3392f6Ba9d5CA",
    USDC: "0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98",
    USDT: "0x3795C36e7D12A8c252A20C5a7B455f7c57b60283",
    DAI: "0x6De33698e9e9b787e09d3Bd7771ef63557E148bb",
    // WBNB: "0x7f27352D5F83Db87a5A3E00f4B07Cc2138D8ee52",
    // MATIC: "0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF",
    // BUSD: "0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E",
    // YUMI: "0x665F8B21878bDECa8bD94507120730a40dCd4F61",
}

const astarTvl = calculateUsdUniTvl(
    FACTORIES,
    "astar",
    NATIVE_TOKEN_WASTR,
    [
        ...Object.values(TOKENS)
    ], "astar")

module.exports = {
    timetravel: true,
    methodology: "TVL comes from the DEX liquidity pools",
    astar: {
        tvl: astarTvl,
    }
}