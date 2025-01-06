const { dLendTvl, dUSDCollateralTvl, dUSDAMOTvl, dLendBorrowed } = require('./helper');

const tvl = async (api) => {
    await Promise.all([
        dLendTvl(api),
        dUSDCollateralTvl(api),
        dUSDAMOTvl(api)
    ]);
    return api.getBalances();
}

module.exports = {
    methodology: 'Includes TVL for dLEND and TVL for dUSD.',
    fraxtal: {
        tvl,
        borrowed: dLendBorrowed
    }
};