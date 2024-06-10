const { staking } = require("../helper/staking");

const MasterChefContract = "0x21F17c2eC5741c1bEb76d50F08171138A6BA97bf";
const KY = "0xa8a33e365D5a03c94C3258A10Dd5d6dfE686941B";

const { getUniTVL } = require('../helper/unknownTokens')
module.exports = {
    misrepresentedTokens: true,
    bsc: {
        tvl: getUniTVL({ factory: '0xbFB0A989e12D49A0a3874770B1C1CdDF0d9162aA', useDefaultCoreAssets: true }),
        staking: staking(MasterChefContract, KY),
    }
};