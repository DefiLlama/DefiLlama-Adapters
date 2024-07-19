const { staking } = require('../helper/staking')

module.exports = {
    ethereum: {
        tvl: () => ({}),
        staking: staking("0x140Fae0A43190A3D0Cbf8DBdB347200EB84E81d1", "0xf19693068120185664E211F619c4F0530cE07088")
    }
}