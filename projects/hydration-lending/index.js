const { lendingTvl, borrowedTvl } = require('./api')

module.exports = {
    timetravel: false,
    methodology: "Counts tokens supplied and borrowed in the Hydration lending market.",
    hydration: {
        tvl: lendingTvl,
        borrowed: borrowedTvl,
    }
}