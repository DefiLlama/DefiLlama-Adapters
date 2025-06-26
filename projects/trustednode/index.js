const { staking } = require('../helper/staking')
const { pool2 } = require('../helper/pool2')

module.exports = {
    bsc: {
        tvl: () => ({}),
        pool2: pool2('0x44dC7FE8e51076De1B9f863138107148b441853C', '0x562C0c707984D40b98cCba889C6847DE274E5d57'),
        staking: staking('0x98386F210af731ECbeE7cbbA12C47A8E65bC8856', '0x7f12a37b6921ffac11fab16338b3ae67ee0c462b'),
    },
    fantom: {
        pool2: pool2('0xe056aba40572f64d98a8c8e717c34e96056c4aad', '0x9206444A1820c508FbA5bF815713451Ee540B3c8'),
    },
}