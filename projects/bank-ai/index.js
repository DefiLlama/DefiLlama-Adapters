const { staking } = require('../helper/staking')

module.exports = {
    ethereum: {
        tvl: () => ({}),
        staking: staking("0x804Bd4F1c9B5D7864d6F215644fb931349EEACA2", "0xe18ab3568fa19e0ed38bc1d974eddd501e61e12d")
    }
}