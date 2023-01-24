const { staking } = require("../helper/staking");

const MasterChefContract = "0x9BA666165867E916Ee7Ed3a3aE6C19415C2fBDDD";
const ZYBER = "0x3B475F6f2f41853706afc9Fa6a6b8C5dF1a2724c";

const { getUniTVL } = require('../helper/unknownTokens')
module.exports = {
    methodology: `Uses factory(0xaC2ee06A14c52570Ef3B9812Ed240BCe359772e7) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
    arbitrum: {
        tvl: getUniTVL({ factory: '0xaC2ee06A14c52570Ef3B9812Ed240BCe359772e7', chain: 'arbitrum' }),
        staking: staking(MasterChefContract, ZYBER, "arbitrum"),
    }
};


