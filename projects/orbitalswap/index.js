const { staking } = require("../helper/staking");

const MasterChefContract = "0xd67a0CE4B1484DBa8dB53349F9b26a3272dB04F5";
const ORB = "0x42b98A2f73a282D731b0B8F4ACfB6cAF3565496B";


const { getUniTVL } = require('../helper/unknownTokens')
module.exports = {
    methodology: `Uses factory(0x1A04Afe9778f95829017741bF46C9524B91433fB) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
    misrepresentedTokens: true,
            incentivized: true,
    bsc: {
        tvl: getUniTVL({ factory: '0x1A04Afe9778f95829017741bF46C9524B91433fB', useDefaultCoreAssets: true }),
        staking: staking(MasterChefContract, ORB),
    }
};


