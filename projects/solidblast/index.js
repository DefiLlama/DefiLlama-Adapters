const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses factory(0x5a79cC04Ad1494A8Ec04cE5C1E25bB50A10111eA) address and whitelisted tokens address to find and price liquidity pool pairs`,
    blast: {
        tvl: getUniTVL({
            factory: "0x5a79cC04Ad1494A8Ec04cE5C1E25bB50A10111eA",
            fetchBalances: true,
            useDefaultCoreAssets: true,
        }),
    },
};