const { staking } = require('../helper/staking')

module.exports = {
    ethereum: {
        tvl: () => { },
        staking: staking("0x3f69Bb14860f7F3348Ac8A5f0D445322143F7feE", "0xbe0ed4138121ecfc5c0e56b40517da27e6c5226b"),
    },
};