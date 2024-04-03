const { getUniTVL,  } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

module.exports = {
    arbitrum: {
        tvl: getUniTVL({
            factory: "0x36800286f652dDC9bDcFfEDc4e71FDd207C1d07C",
            useDefaultCoreAssets: true,
        }),
        staking: staking('0xD5f406eB9E38E3B3E35072A8A35E0DcC671ea8DB', '0x73eD68B834e44096eB4beA6eDeAD038c945722F1')
    }
};