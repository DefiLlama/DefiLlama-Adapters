const { staking } = require("../helper/staking");

const MasterChefContract = "0xdfAa0e08e357dB0153927C7EaBB492d1F60aC730";
const BABY = "0x53E562b9B7E5E94b81f10e96Ee70Ad06df3D2657";

const { getUniTVL } = require('../helper/unknownTokens')
module.exports = {
    methodology: `Uses factory(0x86407bEa2078ea5f5EB5A52B2caA963bC1F889Da) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
    misrepresentedTokens: true,
    bsc: {
        tvl: getUniTVL({ factory: '0x86407bEa2078ea5f5EB5A52B2caA963bC1F889Da', useDefaultCoreAssets: true }),
        staking: staking(MasterChefContract, BABY),
    }
};


