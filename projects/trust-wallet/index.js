const { staking } = require('../helper/staking')

module.exports = {
    methodology: "TVL counts TWT tokens deposited on the Staking contracts.",
    bsc: {
        tvl: () => ({}),
        staking: staking('0x5029f49585D57ed770D2194841B5A0bE06BFc2ED', '0x4b0f1812e5df2a09796481ff14017e6005508003')
    }
}