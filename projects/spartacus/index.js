const { staking } = require('../helper/staking')

module.exports = {
    fantom: {
        tvl: () => 0,
        staking: staking("0x9863056B4Bdb32160A70107a6797dD06B56E8137", "0x5602df4A94eB6C680190ACCFA2A475621E0ddBdc")
    }
}