const { staking } = require("../helper/staking");

const MasterChefContract = "0xD0834fF6122FF8dcf38E3eB79372C00FAeAFa08B";
const WD = "0x88692aD37c48e8F4c821b71484AE3C2878C2A2C6";

const { getUniTVL } = require('../helper/unknownTokens')
module.exports = {
    methodology: `Uses factory(0x6EcCab422D763aC031210895C81787E87B43A652) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
    arbitrum: {
        tvl: getUniTVL({ factory: '0x6EcCab422D763aC031210895C81787E87B43A652', chain: 'arbitrum' }),
        staking: staking(MasterChefContract, WD, "arbitrum"),
    }
};