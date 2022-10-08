const { staking } = require("../helper/staking");

const MasterChefContract = "0xd67a0CE4B1484DBa8dB53349F9b26a3272dB04F5";
const ORB = "0x42b98A2f73a282D731b0B8F4ACfB6cAF3565496B";


const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");
module.exports = {
    methodology: `Uses factory(0x1A04Afe9778f95829017741bF46C9524B91433fB) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
    misrepresentedTokens: true,
    doublecounted: false,
    timetravel: true,
    incentivized: true,
    bsc: {
        tvl: calculateUsdUniTvl(
            "0x1A04Afe9778f95829017741bF46C9524B91433fB",
            "bsc",
            "0x55d398326f99059ff775485246999027b3197955",
            [
                "0x42b98A2f73a282D731b0B8F4ACfB6cAF3565496B",
                "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
                "0xe9e7cea3dedca5984780bafc599bd69add087d56",
                "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
                "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
                "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
            ],
            "tether"
        ),
        staking: staking(MasterChefContract, ORB, "bsc"),
    }
};


