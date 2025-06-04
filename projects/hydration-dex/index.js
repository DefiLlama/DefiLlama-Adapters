const { omnipoolTvl } = require('./api')

module.exports = {
    timetravel: false,
    methodology: "Counts tokens locked in the Hydration Omnipool AMM.",
    hydration: {
        tvl: omnipoolTvl,
    }
}