const { staking } = require("../helper/staking");

const MasterChefContract = "0x8F4Ed4Cf0300E22c739d2E5A22220497B123b66e";
const WTFX = "0x4e6482b05D13085f1C4A7e2Ef612ba43104f71b9";

const { getUniTVL } = require('../helper/unknownTokens')
module.exports = {
    methodology: `Uses factory(0x63FD0a6acBfFB128E7BC7753BFA3B8639A233d50) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
    arbitrum: {
        tvl: getUniTVL({ factory: '0x63FD0a6acBfFB128E7BC7753BFA3B8639A233d50', useDefaultCoreAssets: true }),
        staking: staking(MasterChefContract, WTFX),
    }
};
