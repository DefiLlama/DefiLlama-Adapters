const { staking } = require('../helper/staking')

module.exports = {
    blast: {
        tvl: () => ({}),
        staking: staking("0x6b4e27661ea80f47b9a48331fe6d0260b1ecb28a", "0x67fa2887914fa3729e9eed7630294fe124f417a0")
    }
}