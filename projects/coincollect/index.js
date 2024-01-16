const { staking } = require("../helper/staking");
const { getUniTVL } = require('../helper/unknownTokens')

const MasterChefContract = "0x46A928F2386b8c38cdde028a32c5b7aa19F40445";
const COLLECT = "0x56633733fc8BAf9f730AD2b6b9956Ae22c6d4148";

module.exports = {
    methodology: `Uses factory(0x2bc17223A99B6e2857796a5F64A1ED91067b5657) address to count liquidity in pools as TVL.`,
    misrepresentedTokens: true,
    incentivized: true,
    polygon: {
        tvl: getUniTVL({ factory: '0x2bc17223A99B6e2857796a5F64A1ED91067b5657', useDefaultCoreAssets: true, fetchBalances: true }),
        staking: staking(MasterChefContract, COLLECT),
    }
};


